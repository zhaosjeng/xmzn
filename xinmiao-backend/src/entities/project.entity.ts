import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** 项目状态：待开工 / 施工中 / 已完成 / 已归档 */
export enum ProjectStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column({ nullable: true })
  customerId: number;

  @Column({ nullable: true })
  quoteId: number;

  @Column()
  name: string;

  @Column({ default: ProjectStatus.PENDING })
  status: string;

  @Column({ default: '' })
  address: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  /** 项目经理 */
  @Column({ nullable: true })
  managerId: number;

  /** 进度 0-100 */
  @Column({ default: 0 })
  progress: number;

  /** 合同金额 */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  /** 项目阶段（JSON）：[{key, name, status, doneAt, assignee, remark}] */
  @Column({ type: 'simple-json', nullable: true })
  stages: any;

  /** 现场照片（JSON）：[{stage, url, desc, time}] */
  @Column({ type: 'simple-json', nullable: true })
  photos: any;

  /** 客户分享令牌（免登录查看进度） */
  @Column({ default: '' })
  shareToken: string;

  @Column({ type: 'text', default: '' })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
