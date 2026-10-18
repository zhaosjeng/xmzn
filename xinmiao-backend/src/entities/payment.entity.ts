import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/** 回款记录 */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column({ nullable: true })
  customerId: number;

  @Column({ nullable: true })
  projectId: number;

  /** 回款金额 */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  /** 回款方式：现金/转账/微信/支付宝/刷卡 */
  @Column({ default: '转账' })
  method: string;

  /** 回款日期 */
  @Column({ nullable: true })
  paidAt: Date;

  @Column({ type: 'text', default: '' })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
