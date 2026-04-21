import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { MessagesService } from './messages.service';

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepo = <T extends object>() =>
  ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  }) as MockRepo<T>;

describe('MessagesService', () => {
  let service: MessagesService;
  let messagesRepository: MockRepo<Message>;
  const realtime = {
    publishMessage: jest.fn(),
  };

  beforeEach(async () => {
    messagesRepository = createRepo<Message>();
    realtime.publishMessage.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getRepositoryToken(Message), useValue: messagesRepository },
        { provide: 'MESSAGES_REALTIME_SERVICE', useValue: realtime },
      ],
    }).compile();

    service = moduleRef.get(MessagesService);
  });

  it('returns hydrated message data and publishes realtime event after sending', async () => {
    const dto = {
      content: '你好',
      receiverId: 'user-2',
      type: 'text',
    };
    const created = {
      ...dto,
      senderId: 'user-1',
    } as Message;
    const saved = {
      id: 'message-1',
      ...dto,
      senderId: 'user-1',
      isRead: false,
      createdAt: new Date('2026-04-21T10:00:00Z'),
    } as Message;
    const hydrated = {
      ...saved,
      sender: { id: 'user-1', nickname: '我', avatar: 'me.png' },
      receiver: { id: 'user-2', nickname: 'Ta', avatar: 'you.png' },
    } as Message;

    messagesRepository.create!.mockReturnValue(created);
    messagesRepository.save!.mockResolvedValue(saved);
    messagesRepository.findOne!.mockResolvedValue(hydrated);

    await expect(service.create('user-1', dto)).resolves.toEqual(hydrated);
    expect(realtime.publishMessage).toHaveBeenCalledWith(hydrated);
  });

  it('returns grouped 1v1 conversations with unread counts', async () => {
    const messages = [
      {
        id: 'message-3',
        content: '最近一条',
        senderId: 'user-2',
        receiverId: 'user-1',
        isRead: false,
        createdAt: new Date('2026-04-21T11:00:00Z'),
        sender: { id: 'user-2', nickname: '张同学', avatar: 'zhang.png' },
        receiver: { id: 'user-1', nickname: '我', avatar: 'me.png' },
      },
      {
        id: 'message-2',
        content: '更早的未读',
        senderId: 'user-2',
        receiverId: 'user-1',
        isRead: false,
        createdAt: new Date('2026-04-21T10:00:00Z'),
        sender: { id: 'user-2', nickname: '张同学', avatar: 'zhang.png' },
        receiver: { id: 'user-1', nickname: '我', avatar: 'me.png' },
      },
      {
        id: 'message-1',
        content: '另一位同学',
        senderId: 'user-1',
        receiverId: 'user-3',
        isRead: true,
        createdAt: new Date('2026-04-21T09:00:00Z'),
        sender: { id: 'user-1', nickname: '我', avatar: 'me.png' },
        receiver: { id: 'user-3', nickname: '李同学', avatar: 'li.png' },
      },
    ] as Message[];

    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(messages),
    };

    messagesRepository.createQueryBuilder!.mockReturnValue(queryBuilder);

    await expect(service.findConversations('user-1', 1, 20)).resolves.toEqual({
      data: [
        {
          user: { id: 'user-2', nickname: '张同学', avatar: 'zhang.png' },
          lastMessage: {
            content: '最近一条',
            createdAt: new Date('2026-04-21T11:00:00Z'),
          },
          unreadCount: 2,
        },
        {
          user: { id: 'user-3', nickname: '李同学', avatar: 'li.png' },
          lastMessage: {
            content: '另一位同学',
            createdAt: new Date('2026-04-21T09:00:00Z'),
          },
          unreadCount: 0,
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });
});
