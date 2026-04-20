import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
  ) {}

  async findAll(page = 1, limit = 20, category?: string, status?: string) {
    const query = this.activitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.organizer', 'organizer')
      .where('activity.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('activity.startTime', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) {
      query.andWhere('activity.category = :category', { category });
    }

    if (status) {
      query.andWhere('activity.status = :status', { status });
    }

    const [activities, total] = await query.getManyAndCount();

    return {
      data: activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const activity = await this.activitiesRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['organizer', 'participants'],
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    activity.viewsCount += 1;
    await this.activitiesRepository.save(activity);

    return activity;
  }

  async create(organizerId: string, createActivityDto: CreateActivityDto) {
    const activity = this.activitiesRepository.create({
      ...createActivityDto,
      organizerId,
    });

    return this.activitiesRepository.save(activity);
  }

  async update(userId: string, id: string, updateActivityDto: UpdateActivityDto) {
    const activity = await this.findOne(id);

    if (activity.organizerId !== userId) {
      throw new ForbiddenException('无权限修改此活动');
    }

    Object.assign(activity, updateActivityDto);
    return this.activitiesRepository.save(activity);
  }

  async remove(userId: string, id: string) {
    const activity = await this.findOne(id);

    if (activity.organizerId !== userId) {
      throw new ForbiddenException('无权限删除此活动');
    }

    activity.isDeleted = true;
    await this.activitiesRepository.save(activity);

    return { message: '删除成功' };
  }

  async join(userId: string, activityId: string) {
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId },
      relations: ['participants'],
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    if (activity.maxParticipants && activity.currentParticipants >= activity.maxParticipants) {
      throw new BadRequestException('活动人数已满');
    }

    const alreadyJoined = activity.participants.some((p) => p.id === userId);
    if (alreadyJoined) {
      throw new BadRequestException('已经报名此活动');
    }

    activity.currentParticipants += 1;
    await this.activitiesRepository.save(activity);

    return { message: '报名成功' };
  }

  async leave(userId: string, activityId: string) {
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId },
      relations: ['participants'],
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    activity.currentParticipants = Math.max(0, activity.currentParticipants - 1);
    await this.activitiesRepository.save(activity);

    return { message: '取消报名成功' };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const [activities, total] = await this.activitiesRepository.findAndCount({
      where: { organizerId: userId, isDeleted: false },
      relations: ['organizer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
