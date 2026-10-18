import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column()
  name: string;

  @Column({ default: '' })
  location: string;

  @Column({ default: '' })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;
}
