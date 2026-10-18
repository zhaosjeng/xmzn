import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES = 'sales',
  INSTALLER = 'installer',
  WAREHOUSE = 'warehouse',
  AFTER_SALES = 'after_sales',
  FINANCE = 'finance',
  STAFF = 'staff',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /** 多租户隔离字段：先自用（默认 1），商业化后按租户隔离 */
  @Column({ default: 1 })
  tenantId: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  phone: string;

  /** 云账号邮箱（统一身份）：云登录用户以此字段关联后端账号，本地账号为 null */
  @Column({ nullable: true })
  email: string | null;

  /** 云账号手机号（统一身份）：手机号登录时以此字段关联后端账号 */
  @Column({ nullable: true, unique: true })
  cloudPhone: string | null;

  @Column({ default: UserRole.STAFF })
  role: string;

  @Column({ default: 1 })
  status: number;

  /** 业务员提成比例（%） */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  /** 可访问菜单权限（JSON数组），空数组/null 表示全部 */
  @Column({ type: 'simple-json', nullable: true })
  menus: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
