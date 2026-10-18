import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Quote } from '../../entities/quote.entity';
import { QuoteItem } from '../../entities/quote-item.entity';
import { Customer } from '../../entities/customer.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote) private readonly quoteRepo: Repository<Quote>,
    @InjectRepository(QuoteItem) private readonly itemRepo: Repository<QuoteItem>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  async list(tenantId: number, keyword?: string, status?: string) {
    const qb = this.quoteRepo
      .createQueryBuilder('q')
      .leftJoinAndMapOne('q.customer', 'customers', 'c', 'c.id = q.customerId')
      .where('q.tenantId = :tenantId', { tenantId });
    if (keyword) {
      qb.andWhere('(q.title LIKE :kw OR c.name LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) {
      qb.andWhere('q.status = :status', { status });
    }
    qb.orderBy('q.createdAt', 'DESC');
    return qb.getMany();
  }

  async get(tenantId: number, id: number) {
    const q = await this.quoteRepo.findOne({ where: { id, tenantId } });
    if (!q) throw new NotFoundException('报价单不存在');
    const items = await this.itemRepo.find({ where: { quoteId: id } });
    return { ...q, items };
  }

  /** 创建报价单（含明细），自动计算总额 */
  async create(tenantId: number, dto: any) {
    const installFee = Number(dto.installFee) || 0;
    const total = this.calcTotal(dto.items || []) + installFee;
    const entity = this.quoteRepo.create({
      tenantId,
      title: dto.title,
      customerId: dto.customerId,
      validDays: dto.validDays ?? 15,
      remark: dto.remark,
      installFee,
      totalAmount: total,
    });
    const quote = await this.quoteRepo.save(entity);
    await this.saveItems(quote.id, dto.items || []);
    return this.get(tenantId, quote.id);
  }

  async update(tenantId: number, id: number, dto: any) {
    const quote = await this.quoteRepo.findOne({ where: { id, tenantId } });
    if (!quote) throw new NotFoundException('报价单不存在');
    if (dto.items) {
      await this.itemRepo.delete({ quoteId: id });
      await this.saveItems(id, dto.items);
      const installFee = Number(dto.installFee ?? quote.installFee) || 0;
      dto.totalAmount = this.calcTotal(dto.items) + installFee;
    }
    delete dto.items;
    Object.assign(quote, dto);
    await this.quoteRepo.save(quote);
    return this.get(tenantId, id);
  }

  async remove(tenantId: number, id: number) {
    const quote = await this.quoteRepo.findOne({ where: { id, tenantId } });
    if (!quote) throw new NotFoundException('报价单不存在');
    await this.itemRepo.delete({ quoteId: id });
    await this.quoteRepo.remove(quote);
    return { ok: true };
  }

  private calcTotal(items: QuoteItem[]) {
    return +items
      .reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0)
      .toFixed(2);
  }

  private async saveItems(quoteId: number, items: QuoteItem[]) {
    for (const it of items) {
      const amount = +((Number(it.price) || 0) * (Number(it.quantity) || 1)).toFixed(2);
      await this.itemRepo.save(
        this.itemRepo.create({
          quoteId,
          productId: it.productId || null,
          area: it.area || '',
          productName: it.productName,
          spec: it.spec || '',
          price: it.price || 0,
          quantity: it.quantity || 1,
          amount,
        }),
      );
    }
  }

  /** 生成分享 token（已生成则返回原 token） */
  async generateShareToken(tenantId: number, id: number) {
    const q = await this.quoteRepo.findOne({ where: { id, tenantId } });
    if (!q) throw new NotFoundException('报价单不存在');
    if (!q.shareToken) {
      q.shareToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await this.quoteRepo.save(q);
    }
    return { shareToken: q.shareToken };
  }

  /** 公开接口：按 token 获取完整报价（含客户、明细） */
  async getByShareToken(token: string) {
    const q = await this.quoteRepo.findOne({ where: { shareToken: token } });
    if (!q) throw new NotFoundException('分享链接不存在或已失效');
    const items = await this.itemRepo.find({ where: { quoteId: q.id } });
    // 客户信息（脱敏：只回姓名/电话）
    const customer = q.customerId
      ? await this.customerRepo.findOne({ where: { id: q.customerId, tenantId: q.tenantId } }).catch(() => null)
      : null;
    return {
      id: q.id,
      title: q.title,
      status: q.status,
      totalAmount: q.totalAmount,
      installFee: q.installFee,
      validDays: q.validDays,
      remark: q.remark,
      createdAt: q.createdAt,
      customer: customer ? { name: customer.name, phone: customer.phone, address: customer.address } : null,
      items,
    };
  }
}
