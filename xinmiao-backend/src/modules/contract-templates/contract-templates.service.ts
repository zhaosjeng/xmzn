import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractTemplate } from '../../entities/contract-template.entity';

@Injectable()
export class ContractTemplatesService {
  constructor(
    @InjectRepository(ContractTemplate)
    private readonly repo: Repository<ContractTemplate>,
  ) {}

  async list(tenantId: number) {
    return this.repo.find({ where: { tenantId }, order: { id: 'DESC' } });
  }

  async get(tenantId: number, id: number) {
    return this.repo.findOne({ where: { id, tenantId } });
  }

  async create(tenantId: number, dto: Partial<ContractTemplate>) {
    const t = this.repo.create({ ...dto, tenantId });
    return this.repo.save(t);
  }

  async remove(tenantId: number, id: number) {
    await this.repo.delete({ id, tenantId });
    return { ok: true };
  }
}
