import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['posts', 'circles'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
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
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async follow(followerId: string, followingId: string) {
    const follower = await this.findOne(followerId);
    const following = await this.findOne(followingId);

    if (!follower.following) {
      follower.following = [];
    }

    follower.following.push(following);
    follower.followingCount += 1;
    following.followersCount += 1;

    await this.usersRepository.save(follower);
    await this.usersRepository.save(following);

    return { message: '关注成功' };
  }

  async unfollow(followerId: string, followingId: string) {
    const follower = await this.usersRepository.findOne({
      where: { id: followerId },
      relations: ['following'],
    });

    const following = await this.findOne(followingId);

    follower.following = follower.following.filter((u) => u.id !== followingId);
    follower.followingCount -= 1;
    following.followersCount -= 1;

    await this.usersRepository.save(follower);
    await this.usersRepository.save(following);

    return { message: '取消关注成功' };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following'],
    });

    return {
      data: user.following.slice((page - 1) * limit, page * limit),
      total: user.followingCount,
    };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following'],
    });

    return {
      data: user.following.slice((page - 1) * limit, page * limit),
      total: user.followingCount,
    };
  }
}
