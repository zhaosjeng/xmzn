import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectTask } from '../../entities/project-task.entity';

type ProjectDto = Partial<Project> & { tasks?: ProjectTask[] };

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectTask) private readonly taskRepo: Repository<ProjectTask>,
  ) {}

  async list(tenantId: number, query: { keyword?: string; status?: string; managerId?: number }) {
    const qb = this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndMapOne('p.customer', 'customers', 'c', 'c.id = p.customerId')
      .where('p.tenantId = :tenantId', { tenantId });
    if (query.keyword) {
      qb.andWhere('(p.name LIKE :kw OR c.name LIKE :kw OR p.address LIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }
    if (query.status) {
      qb.andWhere('p.status = :status', { status: query.status });
    }
    if (query.managerId) {
      qb.andWhere('p.managerId = :managerId', { managerId: query.managerId });
    }
    qb.orderBy('p.createdAt', 'DESC');
    return qb.getMany();
  }

  async stats(tenantId: number) {
    const total = await this.projectRepo.count({ where: { tenantId } });
    const inProgress = await this.projectRepo.count({
      where: { tenantId, status: 'in_progress' },
    });
    const completed = await this.projectRepo.count({
      where: { tenantId, status: 'completed' },
    });
    return { total, inProgress, completed };
  }

  async get(tenantId: number, id: number) {
    const p = await this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndMapOne('p.customer', 'customers', 'c', 'c.id = p.customerId')
      .leftJoinAndMapOne('p.quote', 'quotes', 'q', 'q.id = p.quoteId')
      .where('p.id = :id AND p.tenantId = :tenantId', { id, tenantId })
      .getOne();
    if (!p) throw new NotFoundException('项目不存在');
    const tasks = await this.taskRepo
      .createQueryBuilder('t')
      .leftJoinAndMapOne('t.assignee', 'users', 'u', 'u.id = t.assigneeId')
      .where('t.projectId = :id', { id })
      .orderBy('t.sort', 'ASC')
      .addOrderBy('t.id', 'ASC')
      .getMany();
    return { ...p, tasks };
  }

  async create(tenantId: number, dto: ProjectDto) {
    const entity = this.projectRepo.create({ tenantId, ...dto });
    const p = await this.projectRepo.save(entity);
    if (dto.tasks && dto.tasks.length) {
      await this.saveTasks(p.id, dto.tasks);
      const doneCount = dto.tasks.filter((t) => t.status === 'done').length;
      p.progress = Math.round((doneCount / dto.tasks.length) * 100);
      await this.projectRepo.save(p);
    }
    return this.get(tenantId, p.id);
  }

  async update(tenantId: number, id: number, dto: ProjectDto) {
    const p = await this.projectRepo.findOne({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('项目不存在');
    // 进度自动完成：全部节点 done → progress 100
    if (dto.tasks) {
      await this.taskRepo.delete({ projectId: id });
      await this.saveTasks(id, dto.tasks);
      if (dto.tasks.length > 0) {
        const doneCount = dto.tasks.filter((t: any) => t.status === 'done').length;
        dto.progress = Math.round((doneCount / dto.tasks.length) * 100);
      }
    }
    delete dto.tasks;
    Object.assign(p, dto);
    await this.projectRepo.save(p);
    return this.get(tenantId, id);
  }

  async remove(tenantId: number, id: number) {
    const p = await this.projectRepo.findOne({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('项目不存在');
    await this.taskRepo.delete({ projectId: id });
    await this.projectRepo.remove(p);
    return { ok: true };
  }

  private async saveTasks(projectId: number, tasks: ProjectTask[]) {
    let sort = 0;
    for (const t of tasks) {
      await this.taskRepo.save(
        this.taskRepo.create({
          projectId,
          name: t.name,
          status: t.status || 'todo',
          assigneeId: t.assigneeId || null,
          dueDate: t.dueDate || null,
          photos: t.photos || '[]',
          sort: sort++,
        }),
      );
    }
  }
}
