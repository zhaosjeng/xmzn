import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contract_templates')
export class ContractTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column()
  name: string;

  // 模板正文（支持 {{甲方}} {{协议总价}} 等占位符）
  @Column({ type: 'text' })
  content: string;

  @Column({ default: '' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
