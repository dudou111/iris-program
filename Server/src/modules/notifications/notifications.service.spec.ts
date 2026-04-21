import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepo = <T extends object>() =>
  ({
    create: jest.fn((value) => value),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
  }) as MockRepo<T>;

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsRepository: MockRepo<Notification>;

  beforeEach(async () => {
    notificationsRepository = createRepo<Notification>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: notificationsRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  it('returns paginated notifications in reverse chronological order', async () => {
    const notifications = [
      { id: 'notification-2', createdAt: new Date('2026-04-21T10:00:00Z') },
      { id: 'notification-1', createdAt: new Date('2026-04-21T09:00:00Z') },
    ] as Notification[];

    notificationsRepository.findAndCount!.mockResolvedValue([notifications, 2]);

    await expect(service.findAll('user-1', 1, 20)).resolves.toEqual({
      data: notifications,
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it('returns unread notification count for the current user', async () => {
    notificationsRepository.count!.mockResolvedValue(3);

    await expect(service.getUnreadCount('user-1')).resolves.toEqual({ count: 3 });
  });

  it('marks all unread notifications as read', async () => {
    const notifications = [
      { id: 'notification-1', isRead: false },
      { id: 'notification-2', isRead: false },
    ] as Notification[];

    notificationsRepository.find!.mockResolvedValue(notifications);
    notificationsRepository.save!.mockResolvedValue(
      notifications.map((item) => ({ ...item, isRead: true })),
    );

    await expect(service.markAllAsRead('user-1')).resolves.toEqual({ count: 2 });
    expect(notificationsRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'notification-1', isRead: true }),
      expect.objectContaining({ id: 'notification-2', isRead: true }),
    ]);
  });
});
