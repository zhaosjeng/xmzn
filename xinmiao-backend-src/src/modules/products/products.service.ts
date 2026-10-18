import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async list(tenantId: number, keyword?: string, category?: string, brandId?: number) {
    const qb = this.productRepo.createQueryBuilder('p').where('p.tenantId = :tenantId', { tenantId });
    if (keyword) {
      qb.andWhere('(p.name LIKE :kw OR p.brand LIKE :kw OR p.model LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    if (category) {
      qb.andWhere('p.category = :category', { category });
    }
    if (brandId) {
      qb.andWhere('p.brandId = :brandId', { brandId });
    }
    qb.orderBy('p.id', 'DESC');
    return qb.getMany();
  }

  async categories(tenantId: number) {
    const rows = await this.productRepo
      .createQueryBuilder('p')
      .select('DISTINCT p.category', 'category')
      .where('p.tenantId = :tenantId AND p.category <> :empty', { tenantId, empty: '' })
      .getRawMany();
    return rows.map((r) => r.category);
  }

  async get(tenantId: number, id: number) {
    const p = await this.productRepo.findOne({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('产品不存在');
    return p;
  }

  async create(tenantId: number, dto: Partial<Product>) {
    const p = this.productRepo.create({ tenantId, ...dto });
    return this.productRepo.save(p);
  }

  async update(tenantId: number, id: number, dto: Partial<Product>) {
    const p = await this.get(tenantId, id);
    Object.assign(p, dto);
    return this.productRepo.save(p);
  }

  async remove(tenantId: number, id: number) {
    const p = await this.get(tenantId, id);
    await this.productRepo.remove(p);
    return { ok: true };
  }

  /** 批量创建产品（Excel/CSV 导入用） */
  async batchCreate(tenantId: number, items: Partial<Product>[]) {
    const created: Product[] = [];
    for (const dto of items) {
      if (!dto.name) continue;
      const p = this.productRepo.create({
        tenantId,
        name: dto.name,
        brandId: dto.brandId,
        brand: dto.brand || '',
        model: dto.model || '',
        category: dto.category || '',
        unit: dto.unit || '个',
        price: Number(dto.price) || 0,
        cost: Number(dto.cost) || 0,
        safeStock: Number(dto.safeStock) || 0,
      });
      created.push(await this.productRepo.save(p));
    }
    return { ok: true, count: created.length, items: created };
  }
}
