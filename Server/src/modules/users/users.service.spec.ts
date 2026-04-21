import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Post } from '../posts/post.entity';
import { Resource } from '../resources/resource.entity';
import { NotificationsService } from '../notifications/notifications.service';

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepo = <T extends object>() =>
  ({
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  }) as MockRepo<T>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepo<User>;
  let postsRepository: MockRepo<Post>;
  let resourcesRepository: MockRepo<Resource>;
  const notificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    usersRepository = createRepo<User>();
    postsRepository = createRepo<Post>();
    resourcesRepository = createRepo<Resource>();
    notificationsService.create.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(Post), useValue: postsRepository },
        { provide: getRepositoryToken(Resource), useValue: resourcesRepository },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('rejects following yourself', async () => {
    await expect(service.follow('user-1', 'user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('does not increment follower counts for duplicate follow', async () => {
    const target = { id: 'user-2', followersCount: 9 } as User;
    const follower = {
      id: 'user-1',
      following: [target],
      followingCount: 1,
    } as User;

    usersRepository.findOne!
      .mockResolvedValueOnce(follower)
      .mockResolvedValueOnce(target);
    usersRepository.save = jest.fn().mockResolvedValue(follower);

    await expect(service.follow('user-1', 'user-2')).resolves.toEqual({
      following: true,
      followersCount: 9,
      followingCount: 1,
      message: '已关注',
    });
    expect(usersRepository.save).not.toHaveBeenCalled();
    expect(notificationsService.create).not.toHaveBeenCalled();
  });

  it('creates a follow notification when following a new user', async () => {
    const target = { id: 'user-2', followersCount: 9 } as User;
    const follower = {
      id: 'user-1',
      following: [],
      followingCount: 1,
    } as User;

    usersRepository.findOne!
      .mockResolvedValueOnce(follower)
      .mockResolvedValueOnce(target);
    usersRepository.save = jest.fn().mockResolvedValue(follower);

    await expect(service.follow('user-1', 'user-2')).resolves.toEqual({
      following: true,
      followersCount: 10,
      followingCount: 2,
      message: '关注成功',
    });
    expect(notificationsService.create).toHaveBeenCalledWith({
      type: 'follow',
      actorId: 'user-1',
      recipientId: 'user-2',
    });
  });

  it('returns current user collected posts and resources', async () => {
    const post = {
      id: 'post-1',
      content: '收藏动态',
      createdAt: new Date('2026-04-21T00:00:00Z'),
    } as Post;
    const resource = {
      id: 'resource-1',
      title: '收藏资源',
      createdAt: new Date('2026-04-20T00:00:00Z'),
    } as Resource;
    const user = {
      id: 'user-1',
      collectedPosts: [post],
      collectedResources: [resource],
    } as User;

    usersRepository.findOne!.mockResolvedValue(user);

    await expect(service.getCollections('user-1')).resolves.toEqual({
      posts: [expect.objectContaining(post)],
      resources: [expect.objectContaining(resource)],
    });
  });

  it('normalizes collected post and resource image arrays', async () => {
    const post = {
      id: 'post-2',
      content: '带图动态',
      images: ['["/uploads/images/post-a.png"', '"/uploads/images/post-b.png"]'],
      createdAt: new Date('2026-04-21T00:00:00Z'),
      isDeleted: false,
    } as Post;
    const resource = {
      id: 'resource-2',
      title: '带图资源',
      images: ['["/uploads/images/resource-a.png"', '"/uploads/images/resource-b.png"]'],
      createdAt: new Date('2026-04-20T00:00:00Z'),
      isDeleted: false,
    } as Resource;
    const user = {
      id: 'user-1',
      collectedPosts: [post],
      collectedResources: [resource],
    } as User;

    usersRepository.findOne!.mockResolvedValue(user);

    await expect(service.getCollections('user-1')).resolves.toEqual({
      posts: [
        expect.objectContaining({
          images: ['/uploads/images/post-a.png', '/uploads/images/post-b.png'],
        }),
      ],
      resources: [
        expect.objectContaining({
          images: ['/uploads/images/resource-a.png', '/uploads/images/resource-b.png'],
        }),
      ],
    });
  });
});
