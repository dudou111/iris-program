import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async findByPost(postId: string, page = 1, limit = 20) {
    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { postId, isDeleted: false },
      relations: ['author', 'replies', 'replyToUser'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'replies', 'replyToUser'],
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    return comment;
  }

  async create(authorId: string, createCommentDto: CreateCommentDto) {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      authorId,
    });

    return this.commentsRepository.save(comment);
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

    return { message: '删除成功' };
  }

  async like(userId: string, commentId: string) {
    const comment = await this.findOne(commentId);
    comment.likesCount += 1;
    await this.commentsRepository.save(comment);

    return { message: '点赞成功' };
  }

  async unlike(userId: string, commentId: string) {
    const comment = await this.findOne(commentId);
    comment.likesCount = Math.max(0, comment.likesCount - 1);
    await this.commentsRepository.save(comment);

    return { message: '取消点赞成功' };
  }
}
