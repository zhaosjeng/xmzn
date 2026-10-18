import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** 报价单状态：草稿 / 已发送 / 已接受 / 已拒绝 */
export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column({ nullable: true })
  customerId: number;

  @Column()
  title: string;

  @Column({ default: QuoteStatus.DRAFT })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  /** 安装调试费（独立于产品明细） */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  installFee: number;

  /** 附加费用百分比（基于产品明细合计） */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  installFeePct: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionFeePct: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  designFeePct: number;

  @Column({ default: 15 })
  validDays: number;

  @Column({ type: 'text', default: '' })
  remark: string;

  /** 分享链接 token（空表示未生成） */
  @Column({ default: '' })
  shareToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
