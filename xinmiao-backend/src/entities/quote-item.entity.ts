import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('quote_items')
export class QuoteItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quoteId: number;

  @Column({ nullable: true })
  productId: number;

  @Column({ default: '' })
  area: string;

  @Column()
  productName: string;

  @Column({ default: '' })
  spec: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;
}
