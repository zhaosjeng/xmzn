import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** 发票 */
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column({ nullable: true })
  customerId: number;

  @Column({ nullable: true })
  projectId: number;

  /** 发票抬头 */
  @Column()
  title: string;

  /** 税号 */
  @Column({ default: '' })
  taxNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  /** 普票 / 专票 */
  @Column({ default: '普票' })
  type: string;

  /** 状态：未开 / 已开 / 已寄出 / 已签收 */
  @Column({ default: '未开' })
  status: string;

  @Column({ type: 'text', default: '' })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
