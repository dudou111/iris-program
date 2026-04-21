import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'enum', enum: ['secondhand', 'study', 'lost', 'found', 'other'], default: 'secondhand' })
  category: string;

  @Column({ type: 'enum', enum: ['available', 'sold', 'closed'], default: 'available' })
  status: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  contact: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  collectionsCount: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.resources)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  isCollected?: boolean;
}
