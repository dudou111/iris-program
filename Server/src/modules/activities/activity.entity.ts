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

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ type: 'enum', enum: ['lecture', 'competition', 'party', 'sports', 'other'], default: 'other' })
  category: string;

  @Column()
  location: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ nullable: true })
  maxParticipants: number;

  @Column({ default: 0 })
  currentParticipants: number;

  @Column({ type: 'enum', enum: ['upcoming', 'ongoing', 'ended', 'cancelled'], default: 'upcoming' })
  status: string;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.activities)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @Column()
  organizerId: string;

  @ManyToMany(() => User)
  @JoinTable({ name: 'activity_participants' })
  participants: User[];

  @ManyToOne('Circle', { nullable: true })
  @JoinColumn({ name: 'circleId' })
  circle: any;

  @Column({ nullable: true })
  circleId: string;
}
