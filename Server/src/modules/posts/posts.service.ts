import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll(page = 1, limit = 20, category?: string) {
    // 确保 page 和 limit 是数字
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('post.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    if (category && category !== 'all') {
      query.andWhere('post.category = :category', { category });
    }

    const [posts, total] = await query.getManyAndCount();

    return {
      data: posts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'comments'],
    });

    if (!post) {
      throw new NotFoundException('动态不存在');
    }

    post.viewsCount += 1;
    await this.postsRepository.save(post);

    return post;
  }

  async create(authorId: string, createPostDto: CreatePostDto) {
    const post = this.postsRepository.create({
      ...createPostDto,
      authorId,
    });

    return this.postsRepository.save(post);
  }

  async update(userId: string, id: string, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('无权限修改此动态');
    }

    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async remove(userId: string, id: string) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('无权限删除此动态');
    }

    post.isDeleted = true;
    await this.postsRepository.save(post);

    return { message: '删除成功' };
  }

  async like(userId: string, postId: string) {
    const post = await this.findOne(postId);
    post.likesCount += 1;
    await this.postsRepository.save(post);

    return { message: '点赞成功' };
  }

  async unlike(userId: string, postId: string) {
    const post = await this.findOne(postId);
    post.likesCount = Math.max(0, post.likesCount - 1);
    await this.postsRepository.save(post);

    return { message: '取消点赞成功' };
  }

  async collect(userId: string, postId: string) {
    const post = await this.findOne(postId);
    post.collectionsCount += 1;
    await this.postsRepository.save(post);

    return { message: '收藏成功' };
  }

  async uncollect(userId: string, postId: string) {
    const post = await this.findOne(postId);
    post.collectionsCount = Math.max(0, post.collectionsCount - 1);
    await this.postsRepository.save(post);

    return { message: '取消收藏成功' };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    // 确保 page 和 limit 是数字
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const [posts, total] = await this.postsRepository.findAndCount({
      where: { authorId: userId, isDeleted: false },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    return {
      data: posts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
