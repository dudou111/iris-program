import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Circle } from './circle.entity';
import { CreateCircleDto } from './dto/create-circle.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';

@Injectable()
export class CirclesService {
  constructor(
    @InjectRepository(Circle)
    private circlesRepository: Repository<Circle>,
  ) {}

  async findAll(page = 1, limit = 20, category?: string) {
    const query = this.circlesRepository
      .createQueryBuilder('circle')
      .leftJoinAndSelect('circle.creator', 'creator')
      .where('circle.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('circle.membersCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) {
      query.andWhere('circle.category = :category', { category });
    }

    const [circles, total] = await query.getManyAndCount();

    return {
      data: circles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const circle = await this.circlesRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['creator', 'members'],
    });

    if (!circle) {
      throw new NotFoundException('圈子不存在');
    }

    return circle;
  }

  async create(creatorId: string, createCircleDto: CreateCircleDto) {
    const circle = this.circlesRepository.create({
      ...createCircleDto,
      creatorId,
      membersCount: 1,
    });

    return this.circlesRepository.save(circle);
  }

  async update(userId: string, id: string, updateCircleDto: UpdateCircleDto) {
    const circle = await this.findOne(id);

    if (circle.creatorId !== userId) {
      throw new ForbiddenException('无权限修改此圈子');
    }

    Object.assign(circle, updateCircleDto);
    return this.circlesRepository.save(circle);
  }

  async remove(userId: string, id: string) {
    const circle = await this.findOne(id);

    if (circle.creatorId !== userId) {
      throw new ForbiddenException('无权限删除此圈子');
    }

    circle.isDeleted = true;
    await this.circlesRepository.save(circle);

    return { message: '删除成功' };
  }

  async join(userId: string, circleId: string) {
    const circle = await this.circlesRepository.findOne({
      where: { id: circleId },
      relations: ['members'],
    });

    if (!circle) {
      throw new NotFoundException('圈子不存在');
    }

    const alreadyJoined = circle.members.some((m) => m.id === userId);
    if (alreadyJoined) {
      throw new BadRequestException('已经加入此圈子');
    }

    circle.membersCount += 1;
    await this.circlesRepository.save(circle);

    return { message: '加入成功' };
  }

  async leave(userId: string, circleId: string) {
    const circle = await this.circlesRepository.findOne({
      where: { id: circleId },
      relations: ['members'],
    });

    if (!circle) {
      throw new NotFoundException('圈子不存在');
    }

    if (circle.creatorId === userId) {
      throw new BadRequestException('创建者不能退出圈子');
    }

    circle.membersCount = Math.max(0, circle.membersCount - 1);
    await this.circlesRepository.save(circle);

    return { message: '退出成功' };
  }

  async getMembers(circleId: string, page = 1, limit = 20) {
    const circle = await this.circlesRepository.findOne({
      where: { id: circleId },
      relations: ['members'],
    });

    if (!circle) {
      throw new NotFoundException('圈子不存在');
    }

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: circle.members.slice(start, end),
      total: circle.membersCount,
      page,
      limit,
      totalPages: Math.ceil(circle.membersCount / limit),
    };
  }
}
