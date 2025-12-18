import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('configs')
export class Config {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100, comment: '配置键名' })
  key: string;

  @Column({ type: 'text', nullable: true, comment: '配置值' })
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
