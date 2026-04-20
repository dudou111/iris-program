import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Post } from '../posts/post.entity';
import { Resource } from '../resources/resource.entity';
import { Activity } from '../activities/activity.entity';
import { Comment } from '../comments/comment.entity';
import { Message } from '../messages/message.entity';
import { Circle } from '../circles/circle.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  openid: string;

  @Column({ nullable: true })
  unionid: string;

  @Column({ nullable: true })
  studentId: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  school: string;

  @Column({ nullable: true })
  college: string;

  @Column({ nullable: true })
  major: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'enum', enum: ['student', 'teacher', 'admin'], default: 'student' })
  role: string;

  @Column({ default: 0 })
  followersCount: number;

  @Column({ default: 0 })
  followingCount: number;

  @Column({ default: 0 })
  postsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Resource, (resource) => resource.author)
  resources: Resource[];

  @OneToMany(() => Activity, (activity) => activity.organizer)
  activities: Activity[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_follows',
    joinColumn: { name: 'follower_id' },
    inverseJoinColumn: { name: 'following_id' },
  })
  following: User[];

  @ManyToMany(() => Post)
  @JoinTable({ name: 'user_liked_posts' })
  likedPosts: Post[];

  @ManyToMany(() => Post)
  @JoinTable({ name: 'user_collected_posts' })
  collectedPosts: Post[];

  @ManyToMany(() => Resource)
  @JoinTable({ name: 'user_collected_resources' })
  collectedResources: Resource[];

  @ManyToMany(() => Circle, (circle) => circle.members)
  circles: Circle[];
}
