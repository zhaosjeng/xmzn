import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../../entities/contract.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract) private readonly contractRepo: Repository<Contract>,
  ) {}

  async list(tenantId: number, keyword?: string, status?: string) {
    const qb = this.contractRepo
      .createQueryBuilder('c')
      .leftJoinAndMapOne('c.customer', 'customers', 'cu', 'cu.id = c.customerId')
      .leftJoinAndMapOne('c.project', 'projects', 'p', 'p.id = c.projectId')
      .where('c.tenantId = :tenantId', { tenantId });
    if (keyword) qb.andWhere('(c.title LIKE :kw OR cu.name LIKE :kw)', { kw: `%${keyword}%` });
    if (status) qb.andWhere('c.status = :status', { status });
    qb.orderBy('c.id', 'DESC');
    return qb.getMany();
  }

  async get(tenantId: number, id: number) {
    const c = await this.contractRepo
      .createQueryBuilder('c')
      .leftJoinAndMapOne('c.customer', 'customers', 'cu', 'cu.id = c.customerId')
      .leftJoinAndMapOne('c.project', 'projects', 'p', 'p.id = c.projectId')
      .where('c.id = :id AND c.tenantId = :tenantId', { id, tenantId })
      .getOne();
    if (!c) throw new NotFoundException('合同不存在');
    return c;
  }

  async create(tenantId: number, dto: Partial<Contract>) {
    const c = this.contractRepo.create({ tenantId, ...dto });
    return this.contractRepo.save(c);
  }

  async update(tenantId: number, id: number, dto: Partial<Contract>) {
    const c = await this.contractRepo.findOne({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('合同不存在');
    Object.assign(c, dto);
    return this.contractRepo.save(c);
  }

  async remove(tenantId: number, id: number) {
    const c = await this.contractRepo.findOne({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('合同不存在');
    await this.contractRepo.remove(c);
    return { ok: true };
  }
}
