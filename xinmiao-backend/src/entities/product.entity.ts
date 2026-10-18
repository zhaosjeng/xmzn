import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column({ default: '' })
  name: string;

  @Column({ nullable: true })
  brandId: number;

  @Column({ default: '' })
  brand: string;

  @Column({ default: '' })
  model: string;

  @Column({ default: '' })
  category: string;

  @Column({ default: '个' })
  unit: string;

  /** 销售价 */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  /** 成本价 */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cost: number;

  /** 安全库存阈值 */
  @Column({ default: 0 })
  safeStock: number;

  @Column({ default: 1 })
  status: number;

  /** 产品图片URL */
  @Column({ default: '' })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
