import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourcesService } from './resources.service';
import { Resource } from './resource.entity';
import { User } from '../users/user.entity';

type MockRepo<T extends object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepo = <T extends object>() =>
  ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  }) as MockRepo<T>;

describe('ResourcesService', () => {
  let service: ResourcesService;
  let resourcesRepository: MockRepo<Resource>;
  let usersRepository: MockRepo<User>;

  beforeEach(async () => {
    resourcesRepository = createRepo<Resource>();
    usersRepository = createRepo<User>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: getRepositoryToken(Resource), useValue: resourcesRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = moduleRef.get(ResourcesService);
  });

  it('does not increment collections twice for the same resource', async () => {
    const resource = {
      id: 'resource-1',
      collectionsCount: 2,
      viewsCount: 0,
      isDeleted: false,
    } as Resource;
    const viewer = {
      id: 'user-1',
      collectedResources: [resource],
    } as unknown as User;

    resourcesRepository.findOne!.mockResolvedValue(resource);
    usersRepository.findOne!.mockResolvedValue(viewer);
    resourcesRepository.save = jest.fn().mockResolvedValue(resource);
    usersRepository.save = jest.fn().mockResolvedValue(viewer);

    await expect(service.collect('user-1', 'resource-1')).resolves.toEqual({
      collected: true,
      collectionsCount: 2,
      message: '已收藏',
    });
    expect(resourcesRepository.save).not.toHaveBeenCalled();
  });

  it('returns false state when uncollecting a resource not in the relation list', async () => {
    const resource = {
      id: 'resource-2',
      collectionsCount: 0,
      viewsCount: 0,
      isDeleted: false,
    } as Resource;
    const viewer = {
      id: 'user-1',
      collectedResources: [],
    } as unknown as User;

    resourcesRepository.findOne!.mockResolvedValue(resource);
    usersRepository.findOne!.mockResolvedValue(viewer);
    resourcesRepository.save = jest.fn().mockResolvedValue(resource);
    usersRepository.save = jest.fn().mockResolvedValue(viewer);

    await expect(service.uncollect('user-1', 'resource-2')).resolves.toEqual({
      collected: false,
      collectionsCount: 0,
      message: '未收藏',
    });
    expect(resourcesRepository.save).not.toHaveBeenCalled();
  });

  it('normalizes malformed resource images and tags', async () => {
    const resource = {
      id: 'resource-3',
      images: ['["https://example.com/c.png"', '"https://example.com/d.png"]'],
      tags: ['["资料"', '"学习"]'],
      collectionsCount: 0,
      viewsCount: 0,
      isDeleted: false,
      author: { id: 'author-1' },
      createdAt: new Date('2026-04-21T00:00:00Z'),
    } as unknown as Resource;

    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[resource], 1]),
    };
    resourcesRepository.createQueryBuilder!.mockReturnValue(queryBuilder as any);

    const result = await service.findAll(1, 20);

    expect(result.data[0]).toEqual(
      expect.objectContaining({
        images: ['https://example.com/c.png', 'https://example.com/d.png'],
        tags: ['资料', '学习'],
      }),
    );
  });
});
