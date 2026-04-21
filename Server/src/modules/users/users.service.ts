import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Post } from '../posts/post.entity';
import { Resource } from '../resources/resource.entity';
import { normalizeStringArray } from '../../common/utils/normalize-string-array';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private decorateCollectedPost(post: Post) {
    return {
      ...post,
      images: normalizeStringArray(post.images),
      tags: normalizeStringArray(post.tags),
    };
  }

  private decorateCollectedResource(resource: Resource) {
    return {
      ...resource,
      images: normalizeStringArray(resource.images),
      tags: normalizeStringArray(resource.tags),
    };
  }

  private async getViewerFollowingIdSet(viewerId?: string) {
    if (!viewerId) {
      return new Set<string>();
    }

    const viewer = await this.findViewerWithFollowing(viewerId);
    return new Set((viewer.following || []).map((item) => item.id));
  }

  private decorateRelationshipUser(user: User, followingIds: Set<string>) {
    return {
      ...user,
      isFollowing: followingIds.has(user.id),
    };
  }

  async findAll(page = 1, limit = 20) {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async findViewerWithFollowing(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.following = user.following || [];

    return user;
  }

  async findOne(id: string, viewerId?: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['posts', 'circles'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.postsCount = await this.postsRepository.count({
      where: { authorId: id, isDeleted: false },
    });

    if (!viewerId) {
      return {
        ...user,
        isFollowing: false,
      };
    }

    const viewer = await this.findViewerWithFollowing(viewerId);

    return {
      ...user,
      isFollowing: viewer.following.some((item) => item.id === id),
    };
  }

  async getCollections(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: [
        'collectedPosts',
        'collectedPosts.author',
        'collectedResources',
        'collectedResources.author',
      ],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const posts = (user.collectedPosts || [])
      .filter((post) => !post.isDeleted)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const resources = (user.collectedResources || [])
      .filter((resource) => !resource.isDeleted)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      posts: posts.map((post) => this.decorateCollectedPost(post)),
      resources: resources.map((resource) => this.decorateCollectedResource(resource)),
    };
  }

  async findByOpenid(openid: string) {
    return this.usersRepository.findOne({ where: { openid } });
  }

  async findByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(userData: Partial<User>) {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['posts', 'circles'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('不能关注自己');
    }

    const follower = await this.findViewerWithFollowing(followerId);
    const following = await this.usersRepository.findOne({
      where: { id: followingId },
      relations: ['posts', 'circles'],
    });

    if (!following) {
      throw new NotFoundException('用户不存在');
    }

    const alreadyFollowing = follower.following.some((user) => user.id === followingId);

    if (alreadyFollowing) {
      return {
        following: true,
        followersCount: following.followersCount,
        followingCount: follower.followingCount,
        message: '已关注',
      };
    }

    follower.following.push(following);
    follower.followingCount += 1;
    following.followersCount += 1;

    await this.usersRepository.save(follower);
    await this.usersRepository.save(following);
    await this.notificationsService.create({
      type: 'follow',
      actorId: followerId,
      recipientId: followingId,
    });

    return {
      following: true,
      followersCount: following.followersCount,
      followingCount: follower.followingCount,
      message: '关注成功',
    };
  }

  async unfollow(followerId: string, followingId: string) {
    const follower = await this.findViewerWithFollowing(followerId);
    const following = await this.usersRepository.findOne({
      where: { id: followingId },
      relations: ['posts', 'circles'],
    });

    if (!following) {
      throw new NotFoundException('用户不存在');
    }

    const exists = follower.following.some((user) => user.id === followingId);

    if (!exists) {
      return {
        following: false,
        followersCount: following.followersCount,
        followingCount: follower.followingCount,
        message: '未关注',
      };
    }

    follower.following = follower.following.filter((u) => u.id !== followingId);
    follower.followingCount = Math.max(0, follower.followingCount - 1);
    following.followersCount = Math.max(0, following.followersCount - 1);

    await this.usersRepository.save(follower);
    await this.usersRepository.save(following);

    return {
      following: false,
      followersCount: following.followersCount,
      followingCount: follower.followingCount,
      message: '取消关注成功',
    };
  }

  async getFollowers(userId: string, page = 1, limit = 20, viewerId?: string) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const followingIds = await this.getViewerFollowingIdSet(viewerId);
    const [users, total] = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.following', 'following')
      .where('following.id = :userId', { userId })
      .orderBy('user.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount();

    return {
      data: users.map((user) => this.decorateRelationshipUser(user, followingIds)),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  async getFollowing(userId: string, page = 1, limit = 20, viewerId?: string) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const user = await this.findViewerWithFollowing(userId);
    const followingIds = await this.getViewerFollowingIdSet(viewerId);
    const start = (pageNum - 1) * limitNum;
    const items = user.following.slice(start, start + limitNum);

    return {
      data: items.map((item) => this.decorateRelationshipUser(item, followingIds)),
      total: user.following.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(user.following.length / limitNum) || 1,
    };
  }
}
