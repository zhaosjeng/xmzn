import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/** 出入库流水：in 入库 / out 出库 / adjust 盘点调整 */
export enum MovementType {
  IN = 'in',
  OUT = 'out',
  ADJUST = 'adjust',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  tenantId: number;

  @Column()
  warehouseId: number;

  @Column()
  productId: number;

  @Column()
  type: string;

  @Column({ default: 0 })
  quantity: number;

  /** 关联业务：project 项目发货 / purchase 采购入库 / init 初始化 */
  @Column({ default: '' })
  relatedType: string;

  @Column({ nullable: true })
  relatedId: number;

  @Column({ nullable: true })
  operatorId: number;

  @Column({ type: 'text', default: '' })
  remark: string;

  /** 批次号：同一次批量出入库的所有明细共享同一个 batchNo，用于底单调阅 */
  @Column({ default: '' })
  batchNo: string;

  @CreateDateColumn()
  createdAt: Date;
}
