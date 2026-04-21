import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './post.entity';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepo = <T extends object>() =>
  ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  }) as MockRepo<T>;

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: MockRepo<PostEntity>;
  let usersRepository: MockRepo<User>;
  const notificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    postsRepository = createRepo<PostEntity>();
    usersRepository = createRepo<User>();
    notificationsService.create.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(PostEntity), useValue: postsRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  it('returns current state when liking an already liked post', async () => {
    const post = {
      id: 'post-1',
      likesCount: 3,
      collectionsCount: 1,
      viewsCount: 0,
      isDeleted: false,
    } as PostEntity;
    const user = {
      id: 'user-1',
      likedPosts: [post],
      collectedPosts: [],
      following: [],
    } as unknown as User;

    usersRepository.findOne!.mockResolvedValue(user);
    postsRepository.findOne!.mockResolvedValue(post);
    usersRepository.save = jest.fn().mockResolvedValue(user);
    postsRepository.save = jest.fn().mockResolvedValue(post);

    await expect(service.like('user-1', 'post-1')).resolves.toEqual({
      liked: true,
      likesCount: 3,
      message: '已点赞',
    });
    expect(postsRepository.save).not.toHaveBeenCalled();
  });

  it('adds relation and count when liking a fresh post', async () => {
    const post = {
      id: 'post-2',
      authorId: 'author-1',
      likesCount: 0,
      collectionsCount: 0,
      viewsCount: 0,
      isDeleted: false,
    } as PostEntity;
    const user = {
      id: 'user-1',
      likedPosts: [],
      collectedPosts: [],
      following: [],
    } as unknown as User;

    usersRepository.findOne!.mockResolvedValue(user);
    postsRepository.findOne!.mockResolvedValue(post);
    usersRepository.save = jest.fn().mockResolvedValue(user);
    postsRepository.save = jest.fn().mockResolvedValue({ ...post, likesCount: 1 });

    const result = await service.like('user-1', 'post-2');

    expect(result).toEqual({
      liked: true,
      likesCount: 1,
      message: '点赞成功',
    });
    expect(postsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ likesCount: 1 }),
    );
    expect(notificationsService.create).toHaveBeenCalledWith({
      type: 'like',
      actorId: 'user-1',
      recipientId: 'author-1',
      postId: 'post-2',
    });
  });

  it('returns current state when uncollecting a post the user never collected', async () => {
    const post = {
      id: 'post-3',
      likesCount: 0,
      collectionsCount: 0,
      viewsCount: 0,
      isDeleted: false,
    } as PostEntity;
    const user = {
      id: 'user-1',
      likedPosts: [],
      collectedPosts: [],
      following: [],
    } as unknown as User;

    usersRepository.findOne!.mockResolvedValue(user);
    postsRepository.findOne!.mockResolvedValue(post);
    usersRepository.save = jest.fn().mockResolvedValue(user);
    postsRepository.save = jest.fn().mockResolvedValue(post);

    await expect(service.uncollect('user-1', 'post-3')).resolves.toEqual({
      collected: false,
      collectionsCount: 0,
      message: '未收藏',
    });
    expect(postsRepository.save).not.toHaveBeenCalled();
  });

  it('decorates user posts with viewer interaction state', async () => {
    const author = {
      id: 'author-1',
      nickname: '作者',
      avatar: 'avatar.png',
    } as User;
    const post = {
      id: 'post-4',
      authorId: 'author-1',
      author,
      likesCount: 2,
      commentsCount: 1,
      collectionsCount: 1,
      viewsCount: 0,
      isDeleted: false,
      createdAt: new Date('2026-04-21T00:00:00Z'),
    } as PostEntity;
    const viewer = {
      id: 'viewer-1',
      likedPosts: [post],
      collectedPosts: [post],
      following: [author],
      comments: [
        {
          id: 'comment-1',
          postId: 'post-4',
          isDeleted: false,
        },
      ],
    } as unknown as User;

    usersRepository.findOne!.mockResolvedValue(viewer);
    postsRepository.findAndCount = jest.fn().mockResolvedValue([[post], 1]);

    const result = await service.findByUser('author-1', 1, 20, 'viewer-1');

    expect(result).toEqual({
      data: [
        expect.objectContaining({
          id: 'post-4',
          isLiked: true,
          isCollected: true,
          isCommented: true,
          author: expect.objectContaining({
            id: 'author-1',
            isFollowing: true,
          }),
        }),
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it('increments author postsCount when creating a post', async () => {
    const author = { id: 'user-1', postsCount: 2 } as User;
    const savedPost = {
      id: 'post-5',
      authorId: 'user-1',
      content: '新动态',
    } as PostEntity;

    usersRepository.findOne!.mockResolvedValue(author);
    postsRepository.create = jest.fn().mockReturnValue(savedPost);
    postsRepository.save = jest.fn().mockResolvedValue(savedPost);
    usersRepository.save = jest.fn().mockResolvedValue({ ...author, postsCount: 3 });

    await expect(
      service.create('user-1', { content: '新动态', category: 'life' }),
    ).resolves.toBe(savedPost);

    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ postsCount: 3 }),
    );
  });

  it('decrements author postsCount when removing a post', async () => {
    const post = {
      id: 'post-6',
      authorId: 'user-1',
      isDeleted: false,
    } as PostEntity;
    const author = { id: 'user-1', postsCount: 3 } as User;

    postsRepository.findOne!.mockResolvedValue(post);
    usersRepository.findOne!.mockResolvedValue(author);
    postsRepository.save = jest.fn().mockResolvedValue({ ...post, isDeleted: true });
    usersRepository.save = jest.fn().mockResolvedValue({ ...author, postsCount: 2 });

    await expect(service.remove('user-1', 'post-6')).resolves.toEqual({
      message: '删除成功',
    });

    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ postsCount: 2 }),
    );
  });

  it('normalizes malformed image arrays from persisted posts', async () => {
    const author = {
      id: 'author-2',
      nickname: '作者',
      avatar: 'avatar.png',
    } as User;
    const post = {
      id: 'post-7',
      authorId: 'author-2',
      author,
      images: ['null', '["https://example.com/a.png"', '"https://example.com/b.png"]'],
      tags: ['["学习"', '"算法"]'],
      likesCount: 0,
      commentsCount: 0,
      collectionsCount: 0,
      viewsCount: 0,
      isDeleted: false,
      createdAt: new Date('2026-04-21T00:00:00Z'),
    } as unknown as PostEntity;

    postsRepository.findAndCount = jest.fn().mockResolvedValue([[post], 1]);

    const result = await service.findByUser('author-2', 1, 20);

    expect(result.data[0]).toEqual(
      expect.objectContaining({
        images: ['https://example.com/a.png', 'https://example.com/b.png'],
        tags: ['学习', '算法'],
      }),
    );
  });
});
