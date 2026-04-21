import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

export interface CreateNotificationDto {
  type: NotificationType;
  actorId: string;
  recipientId: string;
  postId?: string;
  commentId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    if (createNotificationDto.actorId === createNotificationDto.recipientId) {
      return null;
    }

    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      postId: createNotificationDto.postId ?? null,
      commentId: createNotificationDto.commentId ?? null,
    });
    const saved = await this.notificationsRepository.save(notification);

    return this.notificationsRepository.findOne({
      where: {
        id: saved.id,
        recipientId: createNotificationDto.recipientId,
      },
      relations: ['actor', 'post', 'comment'],
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const [notifications, total] = await this.notificationsRepository.findAndCount({
      where: { recipientId: userId },
      relations: ['actor', 'post', 'comment'],
      order: { createdAt: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    return {
      data: notifications,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationsRepository.count({
      where: { recipientId: userId, isRead: false },
    });

    return { count };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, recipientId: userId },
      relations: ['actor', 'post', 'comment'],
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await this.notificationsRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    const notifications = await this.notificationsRepository.find({
      where: { recipientId: userId, isRead: false },
    });

    if (!notifications.length) {
      return { count: 0 };
    }

    notifications.forEach((item) => {
      item.isRead = true;
    });
    await this.notificationsRepository.save(notifications);

    return { count: notifications.length };
  }
}
