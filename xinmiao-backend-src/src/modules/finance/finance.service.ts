import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Invoice } from '../../entities/invoice.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  // ---------- 回款 ----------
  async listPayments(tenantId: number, query: { customerId?: number; projectId?: number }) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .leftJoinAndMapOne('p.customer', 'customers', 'c', 'c.id = p.customerId')
      .leftJoinAndMapOne('p.project', 'projects', 'pj', 'pj.id = p.projectId')
      .where('p.tenantId = :tenantId', { tenantId });
    if (query.customerId) qb.andWhere('p.customerId = :cid', { cid: query.customerId });
    if (query.projectId) qb.andWhere('p.projectId = :pid', { pid: query.projectId });
    qb.orderBy('p.id', 'DESC');
    return qb.getMany();
  }

  async createPayment(tenantId: number, dto: Partial<Payment>) {
    const p = this.paymentRepo.create({ tenantId, ...dto });
    return this.paymentRepo.save(p);
  }

  async updatePayment(tenantId: number, id: number, dto: Partial<Payment>) {
    const p = await this.paymentRepo.findOne({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('回款记录不存在');
    Object.assign(p, dto);
    return this.paymentRepo.save(p);
  }

  async removePayment(tenantId: number, id: number) {
    const p = await this.paymentRepo.findOne({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('回款记录不存在');
    await this.paymentRepo.remove(p);
    return { ok: true };
  }

  // ---------- 发票 ----------
  async listInvoices(tenantId: number, keyword?: string, status?: string) {
    const qb = this.invoiceRepo
      .createQueryBuilder('i')
      .leftJoinAndMapOne('i.customer', 'customers', 'c', 'c.id = i.customerId')
      .where('i.tenantId = :tenantId', { tenantId });
    if (keyword) qb.andWhere('(i.title LIKE :kw OR c.name LIKE :kw)', { kw: `%${keyword}%` });
    if (status) qb.andWhere('i.status = :status', { status });
    qb.orderBy('i.id', 'DESC');
    return qb.getMany();
  }

  async createInvoice(tenantId: number, dto: Partial<Invoice>) {
    const i = this.invoiceRepo.create({ tenantId, ...dto });
    return this.invoiceRepo.save(i);
  }

  async updateInvoice(tenantId: number, id: number, dto: Partial<Invoice>) {
    const i = await this.invoiceRepo.findOne({ where: { id, tenantId } });
    if (!i) throw new NotFoundException('发票不存在');
    Object.assign(i, dto);
    return this.invoiceRepo.save(i);
  }

  async removeInvoice(tenantId: number, id: number) {
    const i = await this.invoiceRepo.findOne({ where: { id, tenantId } });
    if (!i) throw new NotFoundException('发票不存在');
    await this.invoiceRepo.remove(i);
    return { ok: true };
  }

  // ---------- 财务统计 ----------
  async stats(tenantId: number) {
    const payments = await this.paymentRepo.find({ where: { tenantId } });
    const total = payments.reduce((s, p) => s + Number(p.amount), 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = payments
      .filter((p) => p.paidAt && new Date(p.paidAt) >= monthStart)
      .reduce((s, p) => s + Number(p.amount), 0);

    // 近 6 个月回款趋势
    const trend: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const amount = payments
        .filter((p) => {
          if (!p.paidAt) return false;
          const paid = new Date(p.paidAt);
          return (
            paid.getFullYear() === d.getFullYear() && paid.getMonth() === d.getMonth()
          );
        })
        .reduce((s, p) => s + Number(p.amount), 0);
      trend.push({ month: key, amount: +amount.toFixed(2) });
    }

    const invoicePending = await this.invoiceRepo.count({ where: { tenantId, status: '未开' } });
    return {
      totalPayment: +total.toFixed(2),
      thisMonthPayment: +thisMonth.toFixed(2),
      invoicePending,
      trend,
    };
  }
}
