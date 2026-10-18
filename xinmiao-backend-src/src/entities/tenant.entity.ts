import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 'free' })
  plan: string;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;
}
