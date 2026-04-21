import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';
import { Resource } from '../resources/resource.entity';

type SearchPage<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
  ) {}

  async search(
    q: string,
    type: 'all' | 'posts' | 'users' | 'resources' = 'all',
    page = 1,
    limit = 10,
  ) {
    const keyword = q.trim();

    if (type === 'posts') {
      return this.searchPosts(keyword, page, limit);
    }

    if (type === 'users') {
      return this.searchUsers(keyword, page, limit);
    }

    if (type === 'resources') {
      return this.searchResources(keyword, page, limit);
    }

    const [posts, users, resources] = await Promise.all([
      this.searchPosts(keyword, page, limit),
      this.searchUsers(keyword, page, limit),
      this.searchResources(keyword, page, limit),
    ]);

    return { posts, users, resources };
  }

  async searchPosts(keyword: string, page = 1, limit = 10): Promise<SearchPage<Post>> {
    const normalized = keyword.toLowerCase();
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(post.content) LIKE :keyword', { keyword: `%${normalized}%` })
            .orWhere('LOWER(COALESCE(post.location, \'\')) LIKE :keyword', {
              keyword: `%${normalized}%`,
            })
            .orWhere('LOWER(COALESCE(post.tags, \'\')) LIKE :keyword', {
              keyword: `%${normalized}%`,
            });
        }),
      )
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async searchUsers(keyword: string, page = 1, limit = 10): Promise<SearchPage<User>> {
    const normalized = keyword.toLowerCase();
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where(
        new Brackets((qb) => {
          qb.where('LOWER(user.nickname) LIKE :keyword', { keyword: `%${normalized}%` })
            .orWhere('LOWER(COALESCE(user.school, \'\')) LIKE :keyword', {
              keyword: `%${normalized}%`,
            })
            .orWhere('LOWER(COALESCE(user.college, \'\')) LIKE :keyword', {
              keyword: `%${normalized}%`,
            })
            .orWhere('LOWER(COALESCE(user.major, \'\')) LIKE :keyword', {
              keyword: `%${normalized}%`,
            });
        }),
      )
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async searchResources(
    keyword: string,
    page = 1,
    limit = 10,
  ): Promise<SearchPage<Resource>> {
    const normalized = keyword.toLowerCase();
    const query = this.resourcesRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.author', 'author')
      .where('resource.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(resource.title) LIKE :keyword', { keyword: `%${normalized}%` })
            .orWhere('LOWER(resource.description) LIKE :keyword', {
              keyword: `%${normalized}%`,
            })
            .orWhere('LOWER(COALESCE(resource.tags, \'\')) LIKE :keyword', {
              keyword: `%${normalized}%`,
            });
        }),
      )
      .orderBy('resource.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
