import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

/** 库存汇总（仓库 × 产品 唯一） */
@Entity('stocks')
@Index(['tenantId', 'warehouseId', 'productId'], { unique: true })
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column()
  warehouseId: number;

  @Column()
  productId: number;

  @Column({ default: 0 })
  quantity: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
