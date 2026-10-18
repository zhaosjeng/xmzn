import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AfterSaleOrder } from '../../entities/after-sale-order.entity';
import { AfterSaleRecord } from '../../entities/after-sale-record.entity';

@Injectable()
export class AfterSalesService {
  constructor(
    @InjectRepository(AfterSaleOrder) private readonly orderRepo: Repository<AfterSaleOrder>,
    @InjectRepository(AfterSaleRecord) private readonly recordRepo: Repository<AfterSaleRecord>,
  ) {}

  async list(tenantId: number, query: { keyword?: string; status?: string; assigneeId?: number }) {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndMapOne('o.customer', 'customers', 'c', 'c.id = o.customerId')
      .leftJoinAndMapOne('o.project', 'projects', 'p', 'p.id = o.projectId')
      .leftJoinAndMapOne('o.assignee', 'users', 'u', 'u.id = o.assigneeId')
      .where('o.tenantId = :tenantId', { tenantId });
    if (query.keyword) {
      qb.andWhere('(o.title LIKE :kw OR c.name LIKE :kw)', { kw: `%${query.keyword}%` });
    }
    if (query.status) {
      qb.andWhere('o.status = :status', { status: query.status });
    }
    if (query.assigneeId) {
      qb.andWhere('o.assigneeId = :assigneeId', { assigneeId: query.assigneeId });
    }
    qb.orderBy('o.createdAt', 'DESC');
    return qb.getMany();
  }

  async stats(tenantId: number) {
    const open = await this.orderRepo.count({
      where: { tenantId, status: 'open' },
    });
    const processing = await this.orderRepo.count({
      where: { tenantId, status: 'processing' },
    });
    const done = await this.orderRepo.count({ where: { tenantId, status: 'done' } });
    return { open, processing, done };
  }

  async get(tenantId: number, id: number) {
    const o = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndMapOne('o.customer', 'customers', 'c', 'c.id = o.customerId')
      .leftJoinAndMapOne('o.project', 'projects', 'p', 'p.id = o.projectId')
      .leftJoinAndMapOne('o.assignee', 'users', 'u', 'u.id = o.assigneeId')
      .where('o.id = :id AND o.tenantId = :tenantId', { id, tenantId })
      .getOne();
    if (!o) throw new NotFoundException('售后工单不存在');
    const records = await this.recordRepo
      .createQueryBuilder('r')
      .leftJoinAndMapOne('r.createdBy', 'users', 'u', 'u.id = r.createdById')
      .where('r.orderId = :id', { id })
      .orderBy('r.id', 'ASC')
      .getMany();
    return { ...o, records };
  }

  async create(tenantId: number, dto: Partial<AfterSaleOrder>) {
    const order = await this.orderRepo.save(
      this.orderRepo.create({ tenantId, ...dto }),
    );
    return this.get(tenantId, order.id);
  }

  async update(tenantId: number, id: number, dto: Partial<AfterSaleOrder>) {
    const o = await this.orderRepo.findOne({ where: { id, tenantId } });
    if (!o) throw new NotFoundException('售后工单不存在');
    Object.assign(o, dto);
    await this.orderRepo.save(o);
    return this.get(tenantId, id);
  }

  async remove(tenantId: number, id: number) {
    const o = await this.orderRepo.findOne({ where: { id, tenantId } });
    if (!o) throw new NotFoundException('售后工单不存在');
    await this.recordRepo.delete({ orderId: id });
    await this.orderRepo.remove(o);
    return { ok: true };
  }

  /** 添加处理记录 */
  async addRecord(tenantId: number, orderId: number, userId: number, dto: { content: string; photos?: string }) {
    const o = await this.orderRepo.findOne({ where: { id: orderId, tenantId } });
    if (!o) throw new NotFoundException('售后工单不存在');
    const record = await this.recordRepo.save(
      this.recordRepo.create({
        orderId,
        content: dto.content,
        photos: dto.photos || '[]',
        createdById: userId,
      }),
    );
    return record;
  }
}
