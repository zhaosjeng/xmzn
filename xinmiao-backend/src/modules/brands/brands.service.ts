import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
  ) {}

  async list(tenantId: number) {
    return this.brandRepo.find({ where: { tenantId }, order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async create(tenantId: number, dto: Partial<Brand>) {
    const b = this.brandRepo.create({ tenantId, ...dto });
    return this.brandRepo.save(b);
  }

  async update(tenantId: number, id: number, dto: Partial<Brand>) {
    const b = await this.brandRepo.findOne({ where: { id, tenantId } });
    if (!b) throw new NotFoundException('品牌不存在');
    Object.assign(b, dto);
    return this.brandRepo.save(b);
  }

  async remove(tenantId: number, id: number) {
    const b = await this.brandRepo.findOne({ where: { id, tenantId } });
    if (!b) throw new NotFoundException('品牌不存在');
    await this.brandRepo.remove(b);
    return { ok: true };
  }
}
