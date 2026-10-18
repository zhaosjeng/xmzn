import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** 施工节点状态 */
export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  DONE = 'done',
}

@Entity('project_tasks')
export class ProjectTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

  @Column()
  name: string;

  @Column({ default: TaskStatus.TODO })
  status: string;

  @Column({ nullable: true })
  assigneeId: number;

  @Column({ nullable: true })
  dueDate: Date;

  /** 现场照片，JSON 字符串数组 */
  @Column({ type: 'text', default: '[]' })
  photos: string;

  @Column({ default: 0 })
  sort: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
