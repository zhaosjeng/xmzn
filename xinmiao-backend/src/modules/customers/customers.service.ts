import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
  ) {}

  async list(tenantId: number, query: { keyword?: string; status?: string; ownerId?: number }) {
    const qb = this.customerRepo.createQueryBuilder('c').where('c.tenantId = :tenantId', { tenantId });
    if (query.keyword) {
      qb.andWhere('(c.name LIKE :kw OR c.phone LIKE :kw OR c.address LIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }
    if (query.status) {
      qb.andWhere('c.status = :status', { status: query.status });
    }
    if (query.ownerId) {
      qb.andWhere('c.ownerId = :ownerId', { ownerId: query.ownerId });
    }
    qb.orderBy('c.updatedAt', 'DESC');
    return qb.getMany();
  }

  /** 今日/明日到期跟进统计（看板用） */
  async stats(tenantId: number) {
    const total = await this.customerRepo.count({ where: { tenantId } });
    const signed = await this.customerRepo.count({ where: { tenantId, status: 'signed' } });
    const following = await this.customerRepo.count({ where: { tenantId, status: 'following' } });
    return { total, signed, following };
  }

  async get(tenantId: number, id: number) {
    const c = await this.customerRepo.findOne({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('客户不存在');
    return c;
  }

  async create(tenantId: number, dto: Partial<Customer>) {
    const c = this.customerRepo.create({ tenantId, ...dto });
    return this.customerRepo.save(c);
  }

  async update(tenantId: number, id: number, dto: Partial<Customer>) {
    const c = await this.get(tenantId, id);
    Object.assign(c, dto);
    return this.customerRepo.save(c);
  }

  async remove(tenantId: number, id: number) {
    const c = await this.get(tenantId, id);
    await this.customerRepo.remove(c);
    return { ok: true };
  }
}
