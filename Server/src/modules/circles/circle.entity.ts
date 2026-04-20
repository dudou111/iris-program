import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('circles')
export class Circle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ type: 'enum', enum: ['public', 'private'], default: 'public' })
  type: string;

  @Column({ type: 'enum', enum: ['study', 'sports', 'art', 'tech', 'other'], default: 'other' })
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  membersCount: number;

  @Column({ default: 0 })
  postsCount: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @ManyToMany(() => User, (user) => user.circles)
  @JoinTable({ name: 'circle_members' })
  members: User[];
}
