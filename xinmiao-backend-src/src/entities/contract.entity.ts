import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** 合同状态：草稿 / 已签 / 履约中 / 已完成 / 已终止 */
export enum ContractStatus {
  DRAFT = 'draft',
  SIGNED = 'signed',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
}

@Entity('contracts')
export class Contract {
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

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  /** 签订日期 */
  @Column({ nullable: true })
  signDate: Date;

  @Column({ default: ContractStatus.DRAFT })
  status: string;

  /** 合同正文（电子合同内容） */
  @Column({ type: 'text', default: '' })
  content: string;

  /** 签署方式：线下 / 电子签 */
  @Column({ default: '线下' })
  signWay: string;

  @Column({ type: 'text', default: '' })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
