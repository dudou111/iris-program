import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/user.entity';
import { normalizeStringArray } from '../../common/utils/normalize-string-array';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async findViewer(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['likedPosts', 'collectedPosts', 'following', 'comments'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.likedPosts = user.likedPosts || [];
    user.collectedPosts = user.collectedPosts || [];
    user.following = user.following || [];
    user.comments = user.comments || [];

    return user;
  }

  private async findPostEntity(id: string, relations: string[] = ['author', 'comments']) {
    const post = await this.postsRepository.findOne({
      where: { id, isDeleted: false },
      relations,
    });

    if (!post) {
      throw new NotFoundException('动态不存在');
    }

    return post;
  }

  private decoratePost(post: Post, viewer?: User) {
    const normalizedImages = normalizeStringArray(post.images);
    const normalizedTags = normalizeStringArray(post.tags);
    const author = post.author
      ? {
          ...post.author,
          isFollowing:
            viewer?.following?.some((item) => item.id === post.authorId) ?? false,
        }
      : post.author;

    return {
      ...post,
      images: normalizedImages.length ? normalizedImages : null,
      tags: normalizedTags.length ? normalizedTags : null,
      author,
      isLiked: viewer?.likedPosts?.some((item) => item.id === post.id) ?? false,
      isCollected: viewer?.collectedPosts?.some((item) => item.id === post.id) ?? false,
      isCommented:
        viewer?.comments?.some((item) => item.postId === post.id && !item.isDeleted) ?? false,
    };
  }

  async findAll(page = 1, limit = 20, category?: string, viewerId?: string) {
    // 确保 page 和 limit 是数字
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const viewer = viewerId ? await this.findViewer(viewerId) : undefined;

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
      data: posts.map((post) => this.decoratePost(post, viewer)),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string, viewerId?: string) {
    const [post, viewer] = await Promise.all([
      this.findPostEntity(id),
      viewerId ? this.findViewer(viewerId) : Promise.resolve(undefined),
    ]);

    post.viewsCount += 1;
    await this.postsRepository.save(post);

    return this.decoratePost(post, viewer);
  }

  async create(authorId: string, createPostDto: CreatePostDto) {
    const author = await this.usersRepository.findOne({
      where: { id: authorId },
    });

    if (!author) {
      throw new NotFoundException('用户不存在');
    }

    const post = this.postsRepository.create({
      ...createPostDto,
      images: normalizeStringArray(createPostDto.images),
      tags: normalizeStringArray(createPostDto.tags),
      authorId,
    });

    const savedPost = await this.postsRepository.save(post);
    author.postsCount += 1;
    await this.usersRepository.save(author);

    return savedPost;
  }

  async update(userId: string, id: string, updatePostDto: UpdatePostDto) {
    const post = await this.findPostEntity(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('无权限修改此动态');
    }

    Object.assign(post, {
      ...updatePostDto,
      images:
        updatePostDto.images === undefined
          ? post.images
          : normalizeStringArray(updatePostDto.images),
      tags:
        updatePostDto.tags === undefined
          ? post.tags
          : normalizeStringArray(updatePostDto.tags),
    });
    return this.postsRepository.save(post);
  }

  async remove(userId: string, id: string) {
    const post = await this.findPostEntity(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('无权限删除此动态');
    }

    post.isDeleted = true;
    await this.postsRepository.save(post);

    const author = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (author) {
      author.postsCount = Math.max(0, author.postsCount - 1);
      await this.usersRepository.save(author);
    }

    return { message: '删除成功' };
  }

  async like(userId: string, postId: string) {
    const [viewer, post] = await Promise.all([
      this.findViewer(userId),
      this.findPostEntity(postId, ['author']),
    ]);

    const liked = viewer.likedPosts.some((item) => item.id === postId);

    if (liked) {
      return { liked: true, likesCount: post.likesCount, message: '已点赞' };
    }

    viewer.likedPosts.push(post);
    post.likesCount += 1;
    await this.usersRepository.save(viewer);
    await this.postsRepository.save(post);
    await this.notificationsService.create({
      type: 'like',
      actorId: userId,
      recipientId: post.authorId,
      postId: post.id,
    });

    return { liked: true, likesCount: post.likesCount, message: '点赞成功' };
  }

  async unlike(userId: string, postId: string) {
    const [viewer, post] = await Promise.all([
      this.findViewer(userId),
      this.findPostEntity(postId, ['author']),
    ]);

    const liked = viewer.likedPosts.some((item) => item.id === postId);

    if (!liked) {
      return { liked: false, likesCount: post.likesCount, message: '未点赞' };
    }

    viewer.likedPosts = viewer.likedPosts.filter((item) => item.id !== postId);
    post.likesCount = Math.max(0, post.likesCount - 1);
    await this.usersRepository.save(viewer);
    await this.postsRepository.save(post);

    return { liked: false, likesCount: post.likesCount, message: '取消点赞成功' };
  }

  async collect(userId: string, postId: string) {
    const [viewer, post] = await Promise.all([
      this.findViewer(userId),
      this.findPostEntity(postId, ['author']),
    ]);

    const collected = viewer.collectedPosts.some((item) => item.id === postId);

    if (collected) {
      return {
        collected: true,
        collectionsCount: post.collectionsCount,
        message: '已收藏',
      };
    }

    viewer.collectedPosts.push(post);
    post.collectionsCount += 1;
    await this.usersRepository.save(viewer);
    await this.postsRepository.save(post);

    return {
      collected: true,
      collectionsCount: post.collectionsCount,
      message: '收藏成功',
    };
  }

  async uncollect(userId: string, postId: string) {
    const [viewer, post] = await Promise.all([
      this.findViewer(userId),
      this.findPostEntity(postId, ['author']),
    ]);

    const collected = viewer.collectedPosts.some((item) => item.id === postId);

    if (!collected) {
      return {
        collected: false,
        collectionsCount: post.collectionsCount,
        message: '未收藏',
      };
    }

    viewer.collectedPosts = viewer.collectedPosts.filter((item) => item.id !== postId);
    post.collectionsCount = Math.max(0, post.collectionsCount - 1);
    await this.usersRepository.save(viewer);
    await this.postsRepository.save(post);

    return {
      collected: false,
      collectionsCount: post.collectionsCount,
      message: '取消收藏成功',
    };
  }

  async findByUser(userId: string, page = 1, limit = 20, viewerId?: string) {
    // 确保 page 和 limit 是数字
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const viewer = viewerId ? await this.findViewer(viewerId) : undefined;

    const [posts, total] = await this.postsRepository.findAndCount({
      where: { authorId: userId, isDeleted: false },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    return {
      data: posts.map((post) => this.decoratePost(post, viewer)),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
