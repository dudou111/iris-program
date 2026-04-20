import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async findConversations(userId: string, page = 1, limit = 20) {
    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const conversationsMap = new Map();

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, message);
      }
    });

    return {
      data: Array.from(conversationsMap.values()),
      total: conversationsMap.size,
    };
  }

  async findConversation(userId: string, otherUserId: string, page = 1, limit = 50) {
    const [messages, total] = await this.messagesRepository.findAndCount({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: messages.reverse(),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(senderId: string, createMessageDto: CreateMessageDto) {
    const message = this.messagesRepository.create({
      ...createMessageDto,
      senderId,
    });

    return this.messagesRepository.save(message);
  }

  async markAsRead(userId: string, messageId: string) {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('消息不存在');
    }

    if (message.receiverId !== userId) {
      throw new NotFoundException('无权限操作此消息');
    }

    message.isRead = true;
    await this.messagesRepository.save(message);

    return { message: '标记已读成功' };
  }

  async markConversationAsRead(userId: string, otherUserId: string) {
    await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('receiverId = :userId AND senderId = :otherUserId AND isRead = false', {
        userId,
        otherUserId,
      })
      .execute();

    return { message: '标记已读成功' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.messagesRepository.count({
      where: { receiverId: userId, isRead: false },
    });

    return { count };
  }
}
