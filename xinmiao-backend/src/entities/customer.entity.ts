import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** 客户状态：线索 / 跟进中 / 已报价 / 已签约 / 已流失 */
export enum CustomerStatus {
  LEAD = 'lead',
  FOLLOWING = 'following',
  QUOTED = 'quoted',
  SIGNED = 'signed',
  LOST = 'lost',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column()
  name: string;

  @Column({ default: '' })
  phone: string;

  /** 渠道来源：门店/抖音/转介绍/展会... */
  @Column({ default: '' })
  source: string;

  /** 标签，逗号分隔，如：别墅,改善型,已验房 */
  @Column({ default: '' })
  tags: string;

  @Column({ default: CustomerStatus.LEAD })
  status: string;

  @Column({ default: '' })
  address: string;

  @Column({ type: 'text', default: '' })
  remark: string;

  /** 负责人（销售） */
  @Column({ nullable: true })
  ownerId: number;

  /** 下次跟进时间 */
  @Column({ nullable: true })
  nextFollowAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
