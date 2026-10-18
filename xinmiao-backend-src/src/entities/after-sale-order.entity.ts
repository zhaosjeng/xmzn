import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** 售后工单类型与状态 */
export enum AfterSaleType {
  REPAIR = 'repair',
  REPLACE = 'replace',
  REFUND = 'refund',
  OTHER = 'other',
}

export enum AfterSaleStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  PROCESSING = 'processing',
  DONE = 'done',
  CLOSED = 'closed',
}

@Entity('after_sale_orders')
export class AfterSaleOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column({ nullable: true })
  customerId: number;

  @Column({ nullable: true })
  projectId: number;

  @Column()
  title: string;

  @Column({ default: AfterSaleType.REPAIR })
  type: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ default: AfterSaleStatus.OPEN })
  status: string;

  @Column({ default: 'medium' })
  priority: string;

  @Column({ nullable: true })
  assigneeId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
