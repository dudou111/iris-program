import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { Post as PostEntity } from '../posts/post.entity';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepo = <T extends object>() =>
  ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((value) => value),
    findAndCount: jest.fn(),
  }) as MockRepo<T>;

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepository: MockRepo<Comment>;
  let postsRepository: MockRepo<PostEntity>;
  let usersRepository: MockRepo<User>;
  const notificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    commentsRepository = createRepo<Comment>();
    postsRepository = createRepo<PostEntity>();
    usersRepository = createRepo<User>();
    notificationsService.create.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: commentsRepository },
        { provide: getRepositoryToken(PostEntity), useValue: postsRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = moduleRef.get(CommentsService);
  });

  it('increments post commentsCount when creating a comment', async () => {
    const post = { id: 'post-1', authorId: 'user-2', commentsCount: 0 } as PostEntity;
    const savedComment = { id: 'comment-1', content: 'hello', postId: 'post-1' } as Comment;

    postsRepository.findOne!.mockResolvedValue(post);
    commentsRepository.save = jest.fn().mockResolvedValue(savedComment);
    postsRepository.save = jest.fn().mockResolvedValue({ ...post, commentsCount: 1 });

    await service.create('user-1', { content: 'hello', postId: 'post-1' });

    expect(postsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ commentsCount: 1 }),
    );
    expect(notificationsService.create).toHaveBeenCalledWith({
      type: 'comment',
      actorId: 'user-1',
      recipientId: 'user-2',
      postId: 'post-1',
      commentId: 'comment-1',
    });
  });

  it('returns liked state when liking the same comment twice', async () => {
    const comment = {
      id: 'comment-1',
      likesCount: 4,
      isDeleted: false,
      authorId: 'user-2',
      postId: 'post-1',
    } as Comment;
    const viewer = {
      id: 'user-1',
      likedComments: [comment],
    } as unknown as User;

    commentsRepository.findOne!.mockResolvedValue(comment);
    usersRepository.findOne!.mockResolvedValue(viewer);
    commentsRepository.save = jest.fn().mockResolvedValue(comment);
    usersRepository.save = jest.fn().mockResolvedValue(viewer);

    await expect(service.like('user-1', 'comment-1')).resolves.toEqual({
      liked: true,
      likesCount: 4,
      message: '已点赞',
    });
    expect(commentsRepository.save).not.toHaveBeenCalled();
  });
});
