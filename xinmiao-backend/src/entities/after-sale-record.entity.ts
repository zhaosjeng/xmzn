import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/** 售后处理记录 */
@Entity('after_sale_records')
export class AfterSaleRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column({ type: 'text', default: '' })
  content: string;

  /** 照片，JSON 字符串数组 */
  @Column({ type: 'text', default: '[]' })
  photos: string;

  @Column({ nullable: true })
  createdById: number;

  @CreateDateColumn()
  createdAt: Date;
}
