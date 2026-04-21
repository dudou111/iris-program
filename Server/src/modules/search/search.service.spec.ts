import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';
import { Resource } from '../resources/resource.entity';

describe('SearchService', () => {
  it('returns grouped results for type=all', async () => {
    const postsRepository = { createQueryBuilder: jest.fn() };
    const usersRepository = { createQueryBuilder: jest.fn() };
    const resourcesRepository = { createQueryBuilder: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Post), useValue: postsRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(Resource), useValue: resourcesRepository },
      ],
    }).compile();

    const service = moduleRef.get(SearchService);

    jest.spyOn(service, 'searchPosts').mockResolvedValue({
      data: [{ id: 'post-1' } as Post],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    jest.spyOn(service, 'searchUsers').mockResolvedValue({
      data: [{ id: 'user-1' } as User],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    jest.spyOn(service, 'searchResources').mockResolvedValue({
      data: [{ id: 'resource-1' } as Resource],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    await expect(service.search('iris', 'all', 1, 10)).resolves.toEqual({
      posts: {
        data: [{ id: 'post-1' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      users: {
        data: [{ id: 'user-1' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      resources: {
        data: [{ id: 'resource-1' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });
});
