import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async findViewer(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['likedComments'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.likedComments = user.likedComments || [];

    return user;
  }

  private decorateComment(comment: Comment, viewer?: User) {
    return {
      ...comment,
      isLiked: viewer?.likedComments?.some((item) => item.id === comment.id) ?? false,
    };
  }

  async findByPost(postId: string, page = 1, limit = 20, viewerId?: string) {
    const viewer = viewerId ? await this.findViewer(viewerId) : undefined;
    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { postId, isDeleted: false },
      relations: ['author', 'replies', 'replyToUser'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: comments.map((comment) => this.decorateComment(comment, viewer)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, viewerId?: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'replies', 'replyToUser'],
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    const viewer = viewerId ? await this.findViewer(viewerId) : undefined;

    return this.decorateComment(comment, viewer);
  }

  async create(authorId: string, createCommentDto: CreateCommentDto) {
    const post = await this.postsRepository.findOne({
      where: { id: createCommentDto.postId, isDeleted: false },
    });

    if (!post) {
      throw new NotFoundException('动态不存在');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      authorId,
    });

    const saved = await this.commentsRepository.save(comment);
    post.commentsCount += 1;
    await this.postsRepository.save(post);
    await this.notificationsService.create({
      type: 'comment',
      actorId: authorId,
      recipientId: createCommentDto.replyToUserId || post.authorId,
      postId: post.id,
      commentId: saved.id,
    });

    return saved;
  }

  async update(userId: string, id: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('无权限修改此评论');
    }

    Object.assign(comment, updateCommentDto);
    return this.commentsRepository.save(comment);
  }

  async remove(userId: string, id: string) {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('无权限删除此评论');
    }

    comment.isDeleted = true;
    await this.commentsRepository.save(comment);
    const post = await this.postsRepository.findOne({
      where: { id: comment.postId },
    });

    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await this.postsRepository.save(post);
    }

    return { message: '删除成功' };
  }

  async like(userId: string, commentId: string) {
    const [viewer, comment] = await Promise.all([
      this.findViewer(userId),
      this.findOne(commentId),
    ]);

    const liked = viewer.likedComments.some((item) => item.id === commentId);

    if (liked) {
      return { liked: true, likesCount: comment.likesCount, message: '已点赞' };
    }

    viewer.likedComments.push(comment);
    comment.likesCount += 1;
    await this.usersRepository.save(viewer);
    await this.commentsRepository.save(comment);

    return { liked: true, likesCount: comment.likesCount, message: '点赞成功' };
  }

  async unlike(userId: string, commentId: string) {
    const [viewer, comment] = await Promise.all([
      this.findViewer(userId),
      this.findOne(commentId),
    ]);

    const liked = viewer.likedComments.some((item) => item.id === commentId);

    if (!liked) {
      return { liked: false, likesCount: comment.likesCount, message: '未点赞' };
    }

    viewer.likedComments = viewer.likedComments.filter((item) => item.id !== commentId);
    comment.likesCount = Math.max(0, comment.likesCount - 1);
    await this.usersRepository.save(viewer);
    await this.commentsRepository.save(comment);

    return { liked: false, likesCount: comment.likesCount, message: '取消点赞成功' };
  }
}
