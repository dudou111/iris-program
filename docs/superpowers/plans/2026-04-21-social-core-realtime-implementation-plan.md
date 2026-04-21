# Social Core Realtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved REST-closed-loop social features and then add WebSocket realtime messaging for the Iris campus app.

**Architecture:** Keep the existing uni-app frontend and NestJS + TypeORM backend structure, repair backend state consistency first, then switch frontend pages from mock state to server-backed state, and finally add a JWT-authenticated WebSocket gateway for realtime chat. Backend business rules use Jest-first TDD; frontend page integration is verified with `vue-tsc` and manual flow checks because the repo does not yet contain a frontend test runner.

**Tech Stack:** NestJS 10, TypeORM, PostgreSQL, Passport JWT, multer, ws, uni-app (Vue 3 + TypeScript), Vite

---

## File Structure

- Create: `Server/src/modules/search/search.controller.ts`
- Create: `Server/src/modules/search/search.module.ts`
- Create: `Server/src/modules/search/search.service.ts`
- Create: `Server/src/modules/search/dto/search-query.dto.ts`
- Create: `Server/src/modules/messages/messages.gateway.ts`
- Create: `Server/src/modules/messages/dto/socket-auth-payload.dto.ts`
- Create: `Server/src/modules/posts/posts.service.spec.ts`
- Create: `Server/src/modules/resources/resources.service.spec.ts`
- Create: `Server/src/modules/users/users.service.spec.ts`
- Create: `Server/src/modules/comments/comments.service.spec.ts`
- Create: `Server/src/modules/search/search.service.spec.ts`
- Create: `Server/src/modules/upload/upload.controller.spec.ts`
- Create: `Clint/src/api/upload.ts`
- Create: `Clint/src/api/search.ts`
- Create: `Clint/src/utils/media.ts`
- Create: `Clint/src/utils/chat-socket.ts`
- Modify: `Server/package.json`
- Modify: `Server/package-lock.json`
- Modify: `Server/src/app.module.ts`
- Modify: `Server/src/main.ts`
- Modify: `Server/src/modules/posts/post.entity.ts`
- Modify: `Server/src/modules/posts/posts.module.ts`
- Modify: `Server/src/modules/posts/posts.controller.ts`
- Modify: `Server/src/modules/posts/posts.service.ts`
- Modify: `Server/src/modules/resources/resource.entity.ts`
- Modify: `Server/src/modules/resources/resources.module.ts`
- Modify: `Server/src/modules/resources/resources.controller.ts`
- Modify: `Server/src/modules/resources/resources.service.ts`
- Modify: `Server/src/modules/users/user.entity.ts`
- Modify: `Server/src/modules/users/users.module.ts`
- Modify: `Server/src/modules/users/users.controller.ts`
- Modify: `Server/src/modules/users/users.service.ts`
- Modify: `Server/src/modules/comments/comment.entity.ts`
- Modify: `Server/src/modules/comments/comments.module.ts`
- Modify: `Server/src/modules/comments/comments.controller.ts`
- Modify: `Server/src/modules/comments/comments.service.ts`
- Modify: `Server/src/modules/messages/messages.module.ts`
- Modify: `Server/src/modules/messages/messages.controller.ts`
- Modify: `Server/src/modules/messages/messages.service.ts`
- Modify: `Server/src/modules/upload/upload.controller.ts`
- Modify: `Server/src/modules/upload/upload.module.ts`
- Modify: `Clint/src/api/posts.ts`
- Modify: `Clint/src/api/resources.ts`
- Modify: `Clint/src/api/users.ts`
- Modify: `Clint/src/api/comments.ts`
- Modify: `Clint/src/api/messages.ts`
- Modify: `Clint/src/utils/request.ts`
- Modify: `Clint/src/pages/home/home.vue`
- Modify: `Clint/src/pages/post-detail/post-detail.vue`
- Modify: `Clint/src/pages/publish/publish.vue`
- Modify: `Clint/src/pages/search/search.vue`
- Modify: `Clint/src/pages/user-profile/user-profile.vue`
- Modify: `Clint/src/pages/chat/chat.vue`
- Modify: `.claude/doc/TEST_GUIDE.md`

### Task 1: Repair Post Like and Collect State

**Files:**
- Create: `Server/src/modules/posts/posts.service.spec.ts`
- Modify: `Server/src/modules/posts/post.entity.ts`
- Modify: `Server/src/modules/posts/posts.module.ts`
- Modify: `Server/src/modules/posts/posts.controller.ts`
- Modify: `Server/src/modules/posts/posts.service.ts`
- Modify: `Server/src/modules/users/user.entity.ts`
- Test: `Server/src/modules/posts/posts.service.spec.ts`

- [ ] **Step 1: Write the failing post service tests**

```ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './post.entity';
import { User } from '../users/user.entity';

type MockRepo<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepo = <T,>() => ({
  findOne: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
}) as MockRepo<T>;

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: MockRepo<PostEntity>;
  let usersRepository: MockRepo<User>;

  beforeEach(async () => {
    postsRepository = createRepo<PostEntity>();
    usersRepository = createRepo<User>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(PostEntity), useValue: postsRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  it('returns current state when liking an already liked post', async () => {
    const post = { id: 'post-1', likesCount: 3, collectionsCount: 1 } as PostEntity;
    const user = { id: 'user-1', likedPosts: [post], collectedPosts: [] } as unknown as User;

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
    const post = { id: 'post-2', likesCount: 0, collectionsCount: 0 } as PostEntity;
    const user = { id: 'user-1', likedPosts: [], collectedPosts: [] } as unknown as User;

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
    expect(postsRepository.save).toHaveBeenCalledWith(expect.objectContaining({ likesCount: 1 }));
  });

  it('returns current state when uncollecting a post the user never collected', async () => {
    const post = { id: 'post-3', likesCount: 0, collectionsCount: 0 } as PostEntity;
    const user = { id: 'user-1', likedPosts: [], collectedPosts: [] } as unknown as User;

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- posts.service.spec.ts`
Expected: FAIL because `PostsService` currently injects only the post repository and returns message-only payloads without relation-based state.

- [ ] **Step 3: Write the minimal implementation**

```ts
// Server/src/modules/users/user.entity.ts
@ManyToMany(() => Post)
@JoinTable({ name: 'user_liked_posts' })
likedPosts: Post[];

@ManyToMany(() => Post)
@JoinTable({ name: 'user_collected_posts' })
collectedPosts: Post[];

// Server/src/modules/posts/posts.module.ts
imports: [TypeOrmModule.forFeature([Post, User])]

// Server/src/modules/posts/posts.service.ts
constructor(
  @InjectRepository(Post)
  private postsRepository: Repository<Post>,
  @InjectRepository(User)
  private usersRepository: Repository<User>,
) {}

private async findViewer(userId: string) {
  const user = await this.usersRepository.findOne({
    where: { id: userId },
    relations: ['likedPosts', 'collectedPosts', 'following'],
  });
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  user.likedPosts = user.likedPosts || [];
  user.collectedPosts = user.collectedPosts || [];
  user.following = user.following || [];
  return user;
}

private decoratePost(post: Post, viewer?: User) {
  return {
    ...post,
    isLiked: !!viewer?.likedPosts?.some((item) => item.id === post.id),
    isCollected: !!viewer?.collectedPosts?.some((item) => item.id === post.id),
    author: post.author
      ? {
          ...post.author,
          isFollowing: !!viewer?.following?.some((item) => item.id === post.authorId),
        }
      : post.author,
  };
}

async like(userId: string, postId: string) {
  const [viewer, post] = await Promise.all([this.findViewer(userId), this.findOne(postId)]);
  const liked = viewer.likedPosts.some((item) => item.id === postId);
  if (liked) {
    return { liked: true, likesCount: post.likesCount, message: '已点赞' };
  }
  viewer.likedPosts.push(post);
  post.likesCount += 1;
  await this.usersRepository.save(viewer);
  await this.postsRepository.save(post);
  return { liked: true, likesCount: post.likesCount, message: '点赞成功' };
}

async unlike(userId: string, postId: string) {
  const [viewer, post] = await Promise.all([this.findViewer(userId), this.findOne(postId)]);
  const liked = viewer.likedPosts.some((item) => item.id === postId);
  if (!liked) {
    return { liked: false, likesCount: post.likesCount, message: '未点赞' };
  }
  viewer.likedPosts = viewer.likedPosts.filter((item) => item.id !== postId);
  post.likesCount = Math.max(0, post.likesCount - 1);
  await this.usersRepository.save(viewer);
  await this.postsRepository.save(post);
  return { liked: false, likesCount: post.likesCount, message: '取消点赞成功' };
}

async collect(userId: string, postId: string) {
  const [viewer, post] = await Promise.all([this.findViewer(userId), this.findOne(postId)]);
  const collected = viewer.collectedPosts.some((item) => item.id === postId);
  if (collected) {
    return { collected: true, collectionsCount: post.collectionsCount, message: '已收藏' };
  }
  viewer.collectedPosts.push(post);
  post.collectionsCount += 1;
  await this.usersRepository.save(viewer);
  await this.postsRepository.save(post);
  return { collected: true, collectionsCount: post.collectionsCount, message: '收藏成功' };
}

async uncollect(userId: string, postId: string) {
  const [viewer, post] = await Promise.all([this.findViewer(userId), this.findOne(postId)]);
  const collected = viewer.collectedPosts.some((item) => item.id === postId);
  if (!collected) {
    return { collected: false, collectionsCount: post.collectionsCount, message: '未收藏' };
  }
  viewer.collectedPosts = viewer.collectedPosts.filter((item) => item.id !== postId);
  post.collectionsCount = Math.max(0, post.collectionsCount - 1);
  await this.usersRepository.save(viewer);
  await this.postsRepository.save(post);
  return { collected: false, collectionsCount: post.collectionsCount, message: '取消收藏成功' };
}
```

- [ ] **Step 4: Return decorated posts from list and detail endpoints**

```ts
// Server/src/modules/posts/posts.controller.ts
findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
  @Query('category') category?: string,
  @Request() req?: { user?: { id: string } },
) {
  return this.postsService.findAll(Number(page) || 1, Number(limit) || 20, category, req?.user?.id);
}

findOne(@Param('id') id: string, @Request() req?: { user?: { id: string } }) {
  return this.postsService.findOne(id, req?.user?.id);
}

// Server/src/modules/posts/posts.service.ts
async findAll(page = 1, limit = 20, category?: string, viewerId?: string) {
  const viewer = viewerId ? await this.findViewer(viewerId) : undefined;
  const [posts, total] = await query.getManyAndCount();
  return {
    data: posts.map((post) => this.decoratePost(post, viewer)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async findOne(id: string, viewerId?: string) {
  const viewer = viewerId ? await this.findViewer(viewerId) : undefined;
  return this.decoratePost(post, viewer);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- posts.service.spec.ts`
Expected: PASS with all three tests green.

- [ ] **Step 6: Commit**

```bash
git add Server/src/modules/posts/posts.service.spec.ts Server/src/modules/posts/post.entity.ts Server/src/modules/posts/posts.module.ts Server/src/modules/posts/posts.controller.ts Server/src/modules/posts/posts.service.ts Server/src/modules/users/user.entity.ts
git commit -m "feat: sync post like and collect state"
```

### Task 2: Repair Resource Collect State

**Files:**
- Create: `Server/src/modules/resources/resources.service.spec.ts`
- Modify: `Server/src/modules/resources/resource.entity.ts`
- Modify: `Server/src/modules/resources/resources.module.ts`
- Modify: `Server/src/modules/resources/resources.controller.ts`
- Modify: `Server/src/modules/resources/resources.service.ts`
- Modify: `Server/src/modules/users/user.entity.ts`
- Test: `Server/src/modules/resources/resources.service.spec.ts`

- [ ] **Step 1: Write the failing resource collect tests**

```ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResourcesService } from './resources.service';
import { Resource } from './resource.entity';
import { User } from '../users/user.entity';

describe('ResourcesService', () => {
  it('does not increment collections twice for the same resource', async () => {
    const resource = { id: 'resource-1', collectionsCount: 2 } as Resource;
    const viewer = { id: 'user-1', collectedResources: [resource] } as unknown as User;
    const resourcesRepository = { findOne: jest.fn().mockResolvedValue(resource), save: jest.fn() };
    const usersRepository = { findOne: jest.fn().mockResolvedValue(viewer), save: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: getRepositoryToken(Resource), useValue: resourcesRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    const service = moduleRef.get(ResourcesService);

    await expect(service.collect('user-1', 'resource-1')).resolves.toEqual({
      collected: true,
      collectionsCount: 2,
      message: '已收藏',
    });
  });

  it('returns false state when uncollecting a resource not in the relation list', async () => {
    const resource = { id: 'resource-2', collectionsCount: 0 } as Resource;
    const viewer = { id: 'user-1', collectedResources: [] } as unknown as User;
    const resourcesRepository = { findOne: jest.fn().mockResolvedValue(resource), save: jest.fn() };
    const usersRepository = { findOne: jest.fn().mockResolvedValue(viewer), save: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: getRepositoryToken(Resource), useValue: resourcesRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    const service = moduleRef.get(ResourcesService);

    await expect(service.uncollect('user-1', 'resource-2')).resolves.toEqual({
      collected: false,
      collectionsCount: 0,
      message: '未收藏',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- resources.service.spec.ts`
Expected: FAIL because `ResourcesService` still increments and decrements the count directly.

- [ ] **Step 3: Write the minimal implementation**

```ts
// Server/src/modules/resources/resources.module.ts
imports: [TypeOrmModule.forFeature([Resource, User])]

// Server/src/modules/resources/resources.service.ts
constructor(
  @InjectRepository(Resource)
  private resourcesRepository: Repository<Resource>,
  @InjectRepository(User)
  private usersRepository: Repository<User>,
) {}

private async findViewer(userId: string) {
  const user = await this.usersRepository.findOne({
    where: { id: userId },
    relations: ['collectedResources'],
  });
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  user.collectedResources = user.collectedResources || [];
  return user;
}

private decorateResource(resource: Resource, viewer?: User) {
  return {
    ...resource,
    isCollected: !!viewer?.collectedResources?.some((item) => item.id === resource.id),
  };
}

async collect(userId: string, resourceId: string) {
  const [viewer, resource] = await Promise.all([this.findViewer(userId), this.findOne(resourceId)]);
  const collected = viewer.collectedResources.some((item) => item.id === resourceId);
  if (collected) {
    return { collected: true, collectionsCount: resource.collectionsCount, message: '已收藏' };
  }
  viewer.collectedResources.push(resource);
  resource.collectionsCount += 1;
  await this.usersRepository.save(viewer);
  await this.resourcesRepository.save(resource);
  return { collected: true, collectionsCount: resource.collectionsCount, message: '收藏成功' };
}

async uncollect(userId: string, resourceId: string) {
  const [viewer, resource] = await Promise.all([this.findViewer(userId), this.findOne(resourceId)]);
  const collected = viewer.collectedResources.some((item) => item.id === resourceId);
  if (!collected) {
    return { collected: false, collectionsCount: resource.collectionsCount, message: '未收藏' };
  }
  viewer.collectedResources = viewer.collectedResources.filter((item) => item.id !== resourceId);
  resource.collectionsCount = Math.max(0, resource.collectionsCount - 1);
  await this.usersRepository.save(viewer);
  await this.resourcesRepository.save(resource);
  return { collected: false, collectionsCount: resource.collectionsCount, message: '取消收藏成功' };
}
```

- [ ] **Step 4: Decorate resource list and detail results**

```ts
// Server/src/modules/resources/resources.controller.ts
findAll(
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Query('category') category?: string,
  @Request() req?: { user?: { id: string } },
) {
  return this.resourcesService.findAll(page, limit, category, req?.user?.id);
}

findOne(@Param('id') id: string, @Request() req?: { user?: { id: string } }) {
  return this.resourcesService.findOne(id, req?.user?.id);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- resources.service.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Server/src/modules/resources/resources.service.spec.ts Server/src/modules/resources/resources.module.ts Server/src/modules/resources/resources.controller.ts Server/src/modules/resources/resources.service.ts Server/src/modules/users/user.entity.ts
git commit -m "feat: sync resource collect state"
```

### Task 3: Repair Follow State and User Relationship Lists

**Files:**
- Create: `Server/src/modules/users/users.service.spec.ts`
- Modify: `Server/src/modules/users/user.entity.ts`
- Modify: `Server/src/modules/users/users.module.ts`
- Modify: `Server/src/modules/users/users.controller.ts`
- Modify: `Server/src/modules/users/users.service.ts`
- Test: `Server/src/modules/users/users.service.spec.ts`

- [ ] **Step 1: Write the failing follow tests**

```ts
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  it('rejects following yourself', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue({ id: 'user-1', following: [] }), save: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();
    const service = moduleRef.get(UsersService);
    await expect(service.follow('user-1', 'user-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not increment follower counts for duplicate follow', async () => {
    const target = { id: 'user-2', followersCount: 9 } as User;
    const follower = { id: 'user-1', following: [target], followingCount: 1 } as unknown as User;
    const repository = { findOne: jest.fn().mockResolvedValueOnce(follower).mockResolvedValueOnce(target), save: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();
    const service = moduleRef.get(UsersService);
    await expect(service.follow('user-1', 'user-2')).resolves.toEqual({
      following: true,
      followersCount: 9,
      followingCount: 1,
      message: '已关注',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- users.service.spec.ts`
Expected: FAIL because `UsersService.follow` pushes directly and allows self-follow.

- [ ] **Step 3: Write the minimal implementation**

```ts
// Server/src/modules/users/users.service.ts
private async findViewerWithFollowing(userId: string) {
  const user = await this.usersRepository.findOne({
    where: { id: userId },
    relations: ['following'],
  });
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  user.following = user.following || [];
  return user;
}

async follow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new BadRequestException('不能关注自己');
  }

  const follower = await this.findViewerWithFollowing(followerId);
  const following = await this.findOne(followingId);
  const alreadyFollowing = follower.following.some((user) => user.id === followingId);

  if (alreadyFollowing) {
    return {
      following: true,
      followersCount: following.followersCount,
      followingCount: follower.followingCount,
      message: '已关注',
    };
  }

  follower.following.push(following);
  follower.followingCount += 1;
  following.followersCount += 1;
  await this.usersRepository.save(follower);
  await this.usersRepository.save(following);

  return {
    following: true,
    followersCount: following.followersCount,
    followingCount: follower.followingCount,
    message: '关注成功',
  };
}

async unfollow(followerId: string, followingId: string) {
  const follower = await this.findViewerWithFollowing(followerId);
  const following = await this.findOne(followingId);
  const exists = follower.following.some((user) => user.id === followingId);

  if (!exists) {
    return {
      following: false,
      followersCount: following.followersCount,
      followingCount: follower.followingCount,
      message: '未关注',
    };
  }

  follower.following = follower.following.filter((user) => user.id !== followingId);
  follower.followingCount = Math.max(0, follower.followingCount - 1);
  following.followersCount = Math.max(0, following.followersCount - 1);
  await this.usersRepository.save(follower);
  await this.usersRepository.save(following);

  return {
    following: false,
    followersCount: following.followersCount,
    followingCount: follower.followingCount,
    message: '取消关注成功',
  };
}
```

- [ ] **Step 4: Repair followers and following list queries**

```ts
// Server/src/modules/users/users.service.ts
async getFollowing(userId: string, page = 1, limit = 20) {
  const user = await this.usersRepository.findOne({
    where: { id: userId },
    relations: ['following'],
  });
  if (!user) {
    throw new NotFoundException('用户不存在');
  }

  const start = (page - 1) * limit;
  const items = user.following.slice(start, start + limit);
  return {
    data: items,
    total: user.following.length,
    page,
    limit,
    totalPages: Math.ceil(user.following.length / limit) || 1,
  };
}

async getFollowers(userId: string, page = 1, limit = 20) {
  const [users, total] = await this.usersRepository
    .createQueryBuilder('user')
    .leftJoin('user.following', 'following')
    .where('following.id = :userId', { userId })
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return {
    data: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
```

- [ ] **Step 5: Expose `isFollowing` on user detail**

```ts
// Server/src/modules/users/users.controller.ts
@UseGuards(JwtAuthGuard)
@Get(':id')
findOne(@Param('id') id: string, @Request() req?: { user?: { id: string } }) {
  return this.usersService.findOne(id, req?.user?.id);
}

// Server/src/modules/users/users.service.ts
async findOne(id: string, viewerId?: string) {
  const user = await this.usersRepository.findOne({
    where: { id },
    relations: ['posts', 'circles'],
  });
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  if (!viewerId) {
    return { ...user, isFollowing: false };
  }
  const viewer = await this.findViewerWithFollowing(viewerId);
  return {
    ...user,
    isFollowing: viewer.following.some((item) => item.id === id),
  };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- users.service.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add Server/src/modules/users/users.service.spec.ts Server/src/modules/users/users.controller.ts Server/src/modules/users/users.service.ts
git commit -m "feat: repair follow state and relationship lists"
```

### Task 4: Repair Comment Count and Comment Like State

**Files:**
- Create: `Server/src/modules/comments/comments.service.spec.ts`
- Modify: `Server/src/modules/comments/comment.entity.ts`
- Modify: `Server/src/modules/comments/comments.module.ts`
- Modify: `Server/src/modules/comments/comments.controller.ts`
- Modify: `Server/src/modules/comments/comments.service.ts`
- Modify: `Server/src/modules/posts/post.entity.ts`
- Modify: `Server/src/modules/users/user.entity.ts`
- Test: `Server/src/modules/comments/comments.service.spec.ts`

- [ ] **Step 1: Write the failing comment service tests**

```ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { Post as PostEntity } from '../posts/post.entity';
import { User } from '../users/user.entity';

describe('CommentsService', () => {
  it('increments post commentsCount when creating a comment', async () => {
    const commentRepository = { create: jest.fn((value) => value), save: jest.fn() };
    const postRepository = { findOne: jest.fn().mockResolvedValue({ id: 'post-1', commentsCount: 0 }), save: jest.fn() };
    const userRepository = { findOne: jest.fn().mockResolvedValue({ id: 'user-1', likedComments: [] }) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: commentRepository },
        { provide: getRepositoryToken(PostEntity), useValue: postRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();
    const service = moduleRef.get(CommentsService);
    await service.create('user-1', { content: 'hello', postId: 'post-1' });
    expect(postRepository.save).toHaveBeenCalledWith(expect.objectContaining({ commentsCount: 1 }));
  });

  it('returns liked state when liking the same comment twice', async () => {
    const comment = { id: 'comment-1', likesCount: 4 } as Comment;
    const viewer = { id: 'user-1', likedComments: [comment] } as unknown as User;
    const commentRepository = { findOne: jest.fn().mockResolvedValue(comment), save: jest.fn() };
    const postRepository = { findOne: jest.fn(), save: jest.fn() };
    const userRepository = { findOne: jest.fn().mockResolvedValue(viewer), save: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: commentRepository },
        { provide: getRepositoryToken(PostEntity), useValue: postRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();
    const service = moduleRef.get(CommentsService);
    await expect(service.like('user-1', 'comment-1')).resolves.toEqual({
      liked: true,
      likesCount: 4,
      message: '已点赞',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- comments.service.spec.ts`
Expected: FAIL because the service does not yet inject post or user repositories.

- [ ] **Step 3: Write the minimal implementation**

```ts
// Server/src/modules/users/user.entity.ts
@ManyToMany(() => Comment)
@JoinTable({ name: 'user_liked_comments' })
likedComments: Comment[];

// Server/src/modules/comments/comments.module.ts
imports: [TypeOrmModule.forFeature([Comment, Post, User])]

// Server/src/modules/comments/comments.service.ts
constructor(
  @InjectRepository(Comment)
  private commentsRepository: Repository<Comment>,
  @InjectRepository(Post)
  private postsRepository: Repository<Post>,
  @InjectRepository(User)
  private usersRepository: Repository<User>,
) {}

private async findViewer(userId: string) {
  const user = await this.usersRepository.findOne({
    where: { id: userId },
    relations: ['likedComments'],
  });
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  user.likedComments = user.likedComments || [];
  return user;
}

private decorateComment(comment: Comment, viewer?: User) {
  return {
    ...comment,
    isLiked: !!viewer?.likedComments?.some((item) => item.id === comment.id),
  };
}

async create(authorId: string, createCommentDto: CreateCommentDto) {
  const post = await this.postsRepository.findOne({ where: { id: createCommentDto.postId, isDeleted: false } });
  if (!post) {
    throw new NotFoundException('动态不存在');
  }
  const comment = this.commentsRepository.create({ ...createCommentDto, authorId });
  const saved = await this.commentsRepository.save(comment);
  post.commentsCount += 1;
  await this.postsRepository.save(post);
  return saved;
}

async remove(userId: string, id: string) {
  const comment = await this.findOne(id);
  if (comment.authorId !== userId) {
    throw new ForbiddenException('无权限删除此评论');
  }
  comment.isDeleted = true;
  await this.commentsRepository.save(comment);
  const post = await this.postsRepository.findOne({ where: { id: comment.postId } });
  if (post) {
    post.commentsCount = Math.max(0, post.commentsCount - 1);
    await this.postsRepository.save(post);
  }
  return { message: '删除成功' };
}
```

- [ ] **Step 4: Make comment list return `isLiked`**

```ts
// Server/src/modules/comments/comments.controller.ts
findByPost(
  @Param('postId') postId: string,
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Request() req?: { user?: { id: string } },
) {
  return this.commentsService.findByPost(postId, Number(page) || 1, Number(limit) || 20, req?.user?.id);
}

// Server/src/modules/comments/comments.service.ts
async findByPost(postId: string, page = 1, limit = 20, viewerId?: string) {
  const viewer = viewerId ? await this.findViewer(viewerId) : undefined;
  const [comments, total] = await this.commentsRepository.findAndCount({
    where: { postId, isDeleted: false },
    relations: ['author', 'replies', 'replyToUser'],
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
  return {
    data: comments.map((comment) => this.decorateComment(comment, viewer)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
```

- [ ] **Step 5: Add relation-based like and unlike methods**

```ts
async like(userId: string, commentId: string) {
  const [viewer, comment] = await Promise.all([this.findViewer(userId), this.findOne(commentId)]);
  const liked = viewer.likedComments.some((item) => item.id === commentId);
  if (liked) {
    return { liked: true, likesCount: comment.likesCount, message: '已点赞' };
  }
  viewer.likedComments.push(comment);
  comment.likesCount += 1;
  await this.usersRepository.save(viewer);
  await this.commentsRepository.save(comment);
  return { liked: true, likesCount: comment.likesCount, message: '点赞成功' };
}

async unlike(userId: string, commentId: string) {
  const [viewer, comment] = await Promise.all([this.findViewer(userId), this.findOne(commentId)]);
  const liked = viewer.likedComments.some((item) => item.id === commentId);
  if (!liked) {
    return { liked: false, likesCount: comment.likesCount, message: '未点赞' };
  }
  viewer.likedComments = viewer.likedComments.filter((item) => item.id !== commentId);
  comment.likesCount = Math.max(0, comment.likesCount - 1);
  await this.usersRepository.save(viewer);
  await this.commentsRepository.save(comment);
  return { liked: false, likesCount: comment.likesCount, message: '取消点赞成功' };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- comments.service.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add Server/src/modules/comments/comments.service.spec.ts Server/src/modules/comments/comments.module.ts Server/src/modules/comments/comments.controller.ts Server/src/modules/comments/comments.service.ts Server/src/modules/users/user.entity.ts
git commit -m "feat: sync comment counts and like state"
```

### Task 5: Harden Upload Module and Connect Publish API

**Files:**
- Create: `Server/src/modules/upload/upload.controller.spec.ts`
- Create: `Clint/src/api/upload.ts`
- Create: `Clint/src/utils/media.ts`
- Modify: `Server/src/main.ts`
- Modify: `Server/src/modules/upload/upload.controller.ts`
- Modify: `Server/src/modules/upload/upload.module.ts`
- Modify: `Clint/src/utils/request.ts`
- Modify: `Clint/src/pages/publish/publish.vue`
- Test: `Server/src/modules/upload/upload.controller.spec.ts`

- [ ] **Step 1: Write the failing upload controller tests**

```ts
import { BadRequestException } from '@nestjs/common';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  const controller = new UploadController();

  it('throws when file payload is missing', () => {
    expect(() => controller.uploadImage(undefined as never)).toThrow(BadRequestException);
  });

  it('returns normalized image metadata when file payload exists', () => {
    const result = controller.uploadImage({
      filename: 'abc.png',
      size: 1024,
    } as Express.Multer.File);

    expect(result).toEqual({
      url: '/uploads/images/abc.png',
      filename: 'abc.png',
      size: 1024,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- upload.controller.spec.ts`
Expected: FAIL if the controller signature or return payload changes from the plan.

- [ ] **Step 3: Ensure the upload directory exists at boot**

```ts
// Server/src/main.ts
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const uploadsDir = join(__dirname, '..', 'uploads', 'images');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

- [ ] **Step 4: Add frontend upload helpers**

```ts
// Clint/src/api/upload.ts
import { uploadFiles } from '@/utils/media';

export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
}

export async function uploadPostImages(paths: string[]) {
  const files = await uploadFiles(paths, '/upload/images', 'files');
  return files.files as UploadedImage[];
}

// Clint/src/utils/media.ts
import { getBaseUrl, getAuthHeader } from '@/utils/request';

export function uploadFiles(paths: string[], url: string, name: string) {
  return new Promise<any>((resolve, reject) => {
    uni.uploadFile({
      url: getBaseUrl() + url,
      files: paths.map((path) => ({ uri: path, name })),
      name,
      header: getAuthHeader(),
      success: (res) => resolve(JSON.parse(res.data).data),
      fail: reject,
    });
  });
}
```

- [ ] **Step 5: Connect the publish page to upload and create APIs**

```ts
// Clint/src/pages/publish/publish.vue
import { createPost } from '@/api/posts';
import { uploadPostImages } from '@/api/upload';

const submitting = ref(false);

const handlePublish = async () => {
  if (!content.value.trim() || submitting.value) {
    return;
  }

  submitting.value = true;
  try {
    const uploaded = images.value.length ? await uploadPostImages(images.value) : [];
    await createPost({
      content: content.value.trim(),
      category: selectedTopic.value.id,
      images: uploaded.map((item) => item.url),
    });
    uni.showToast({ title: '发布成功', icon: 'success' });
    uni.$emit('post:published');
    setTimeout(() => uni.navigateBack(), 1200);
  } finally {
    submitting.value = false;
  }
};
```

- [ ] **Step 6: Run upload test and frontend type-check**

Run: `npm test -- upload.controller.spec.ts`
Expected: PASS.

Run: `npm run type-check`
Expected: PASS in `Clint`.

- [ ] **Step 7: Commit**

```bash
git add Server/src/main.ts Server/src/modules/upload/upload.controller.spec.ts Server/src/modules/upload/upload.controller.ts Clint/src/api/upload.ts Clint/src/utils/media.ts Clint/src/utils/request.ts Clint/src/pages/publish/publish.vue
git commit -m "feat: connect image upload to publishing"
```

### Task 6: Add Backend Search Module

**Files:**
- Create: `Server/src/modules/search/search.controller.ts`
- Create: `Server/src/modules/search/search.module.ts`
- Create: `Server/src/modules/search/search.service.ts`
- Create: `Server/src/modules/search/dto/search-query.dto.ts`
- Create: `Server/src/modules/search/search.service.spec.ts`
- Modify: `Server/src/app.module.ts`
- Test: `Server/src/modules/search/search.service.spec.ts`

- [ ] **Step 1: Write the failing search service tests**

```ts
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
    jest.spyOn(service, 'searchPosts').mockResolvedValue({ data: [{ id: 'post-1' }], total: 1, page: 1, limit: 10, totalPages: 1 });
    jest.spyOn(service, 'searchUsers').mockResolvedValue({ data: [{ id: 'user-1' }], total: 1, page: 1, limit: 10, totalPages: 1 });
    jest.spyOn(service, 'searchResources').mockResolvedValue({ data: [{ id: 'resource-1' }], total: 1, page: 1, limit: 10, totalPages: 1 });

    await expect(service.search('iris', 'all', 1, 10)).resolves.toEqual({
      posts: { data: [{ id: 'post-1' }], total: 1, page: 1, limit: 10, totalPages: 1 },
      users: { data: [{ id: 'user-1' }], total: 1, page: 1, limit: 10, totalPages: 1 },
      resources: { data: [{ id: 'resource-1' }], total: 1, page: 1, limit: 10, totalPages: 1 },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- search.service.spec.ts`
Expected: FAIL because the search module does not exist yet.

- [ ] **Step 3: Add the DTO, service, controller, and module**

```ts
// Server/src/modules/search/dto/search-query.dto.ts
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsEnum(['all', 'posts', 'users', 'resources'])
  type?: 'all' | 'posts' | 'users' | 'resources';

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}

// Server/src/modules/search/search.service.ts
async search(q: string, type: 'all' | 'posts' | 'users' | 'resources' = 'all', page = 1, limit = 10) {
  const keyword = q.trim();
  if (type === 'posts') return this.searchPosts(keyword, page, limit);
  if (type === 'users') return this.searchUsers(keyword, page, limit);
  if (type === 'resources') return this.searchResources(keyword, page, limit);
  const [posts, users, resources] = await Promise.all([
    this.searchPosts(keyword, page, limit),
    this.searchUsers(keyword, page, limit),
    this.searchResources(keyword, page, limit),
  ]);
  return { posts, users, resources };
}
```

- [ ] **Step 4: Register the search module**

```ts
// Server/src/app.module.ts
import { SearchModule } from './modules/search/search.module';

imports: [
  ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
  TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
  AuthModule,
  UsersModule,
  PostsModule,
  ResourcesModule,
  ActivitiesModule,
  CirclesModule,
  CommentsModule,
  MessagesModule,
  UploadModule,
  SearchModule,
]
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- search.service.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Server/src/app.module.ts Server/src/modules/search/search.controller.ts Server/src/modules/search/search.module.ts Server/src/modules/search/search.service.ts Server/src/modules/search/dto/search-query.dto.ts Server/src/modules/search/search.service.spec.ts
git commit -m "feat: add unified search module"
```

### Task 7: Switch Frontend Pages to Real REST State

**Files:**
- Modify: `Clint/src/api/posts.ts`
- Modify: `Clint/src/api/resources.ts`
- Modify: `Clint/src/api/users.ts`
- Modify: `Clint/src/api/comments.ts`
- Modify: `Clint/src/pages/home/home.vue`
- Modify: `Clint/src/pages/post-detail/post-detail.vue`
- Modify: `Clint/src/pages/user-profile/user-profile.vue`
- Test: `Clint` type-check

- [ ] **Step 1: Extend API typings to match the backend state fields**

```ts
// Clint/src/api/posts.ts
export interface Post {
  id: string;
  content: string;
  images?: string[];
  category: string;
  likesCount: number;
  commentsCount: number;
  collectionsCount: number;
  isLiked: boolean;
  isCollected: boolean;
  author: {
    id: string;
    nickname: string;
    avatar: string;
    isFollowing?: boolean;
  };
  createdAt: string;
}

// Clint/src/api/users.ts
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

// Clint/src/api/comments.ts
export interface Comment {
  id: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  author: {
    id: string;
    nickname: string;
    avatar: string;
  };
  createdAt: string;
}
```

- [ ] **Step 2: Replace mock state in the home page**

```ts
// Clint/src/pages/home/home.vue
const mapPost = (post: Post) => ({
  id: post.id,
  avatar: post.author?.avatar || defaultAvatar(post.author?.nickname || post.id),
  username: post.author?.nickname || '未知用户',
  time: formatTime(post.createdAt),
  content: post.content,
  images: post.images || [],
  likes: post.likesCount,
  comments: post.commentsCount,
  collects: post.collectionsCount,
  isLiked: post.isLiked,
  isCollected: post.isCollected,
});

uni.$on('post:published', () => {
  loadPosts(true);
});
```

- [ ] **Step 3: Replace mock state in the post detail page**

```ts
// Clint/src/pages/post-detail/post-detail.vue
import { createComment, getPostComments, likeComment, unlikeComment } from '@/api/comments';
import { followUser, unfollowUser } from '@/api/users';

const loadComments = async () => {
  const id = getPostId();
  const res = await getPostComments(id, { page: 1, limit: 20 });
  comments.value = res.data.map((comment) => ({
    id: comment.id,
    avatar: comment.author?.avatar || defaultAvatar(comment.author?.nickname || comment.id),
    username: comment.author?.nickname || '未知用户',
    time: formatTime(comment.createdAt),
    content: comment.content,
    likes: comment.likesCount,
    isLiked: comment.isLiked,
  }));
};

const handleSendComment = async () => {
  if (!commentText.value.trim() || !post.value) return;
  await createComment({ content: commentText.value.trim(), postId: post.value.id });
  commentText.value = '';
  await Promise.all([loadPostDetail(), loadComments()]);
};
```

- [ ] **Step 4: Replace mock state in the user profile page**

```ts
// Clint/src/pages/user-profile/user-profile.vue
import { getUserDetail, followUser, unfollowUser } from '@/api/users';
import { getUserPosts } from '@/api/posts';

const loadProfile = async () => {
  const id = getUserId();
  const [profile, posts] = await Promise.all([
    getUserDetail(id),
    getUserPosts(id, { page: 1, limit: 20 }),
  ]);

  user.value = {
    id: profile.id,
    avatar: profile.avatar || defaultAvatar(profile.nickname || profile.id),
    username: profile.nickname,
    bio: profile.bio || '',
    posts: profile.postsCount,
    followers: profile.followersCount,
    following: profile.followingCount,
    isFollowing: !!profile.isFollowing,
  };

  userPosts.value = posts.data.map((post) => ({
    id: post.id,
    content: post.content,
    images: post.images || [],
    time: formatTime(post.createdAt),
    likes: post.likesCount,
    comments: post.commentsCount,
  }));
};
```

- [ ] **Step 5: Run frontend type-check**

Run: `npm run type-check`
Expected: PASS in `Clint`.

- [ ] **Step 6: Commit**

```bash
git add Clint/src/api/posts.ts Clint/src/api/resources.ts Clint/src/api/users.ts Clint/src/api/comments.ts Clint/src/pages/home/home.vue Clint/src/pages/post-detail/post-detail.vue Clint/src/pages/user-profile/user-profile.vue
git commit -m "feat: connect social pages to real state"
```

### Task 8: Add Search Page Integration

**Files:**
- Create: `Clint/src/api/search.ts`
- Modify: `Clint/src/pages/search/search.vue`
- Test: `Clint` type-check

- [ ] **Step 1: Add the search API client**

```ts
// Clint/src/api/search.ts
import { get } from '@/utils/request';

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchAllResponse {
  posts: SearchResult<any>;
  users: SearchResult<any>;
  resources: SearchResult<any>;
}

export function searchAll(q: string) {
  return get<SearchAllResponse>('/search', { q, type: 'all', page: 1, limit: 10 });
}
```

- [ ] **Step 2: Replace static results in the search page**

```ts
// Clint/src/pages/search/search.vue
import { searchAll } from '@/api/search';

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const executeSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = { posts: [], users: [], resources: [] };
    return;
  }

  const response = await searchAll(searchQuery.value.trim());
  searchResults.value = {
    posts: response.posts.data.map((post) => ({
      id: post.id,
      avatar: post.author?.avatar || defaultAvatar(post.author?.nickname || post.id),
      username: post.author?.nickname || '未知用户',
      time: formatTime(post.createdAt),
      content: post.content,
    })),
    users: response.users.data.map((user) => ({
      id: user.id,
      avatar: user.avatar || defaultAvatar(user.nickname || user.id),
      username: user.nickname,
      bio: user.bio || '',
      isFollowing: !!user.isFollowing,
    })),
    resources: response.resources.data.map((resource) => ({
      id: resource.id,
      cover: resource.images?.[0] || '',
      title: resource.title,
      category: resource.category,
      downloads: resource.collectionsCount,
    })),
  };
};

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    executeSearch();
  }, 250);
};
```

- [ ] **Step 3: Run frontend type-check**

Run: `npm run type-check`
Expected: PASS in `Clint`.

- [ ] **Step 4: Commit**

```bash
git add Clint/src/api/search.ts Clint/src/pages/search/search.vue
git commit -m "feat: connect unified search page"
```

### Task 9: Connect Chat REST Flow

**Files:**
- Modify: `Clint/src/api/messages.ts`
- Modify: `Clint/src/pages/chat/chat.vue`
- Test: `Clint` type-check

- [ ] **Step 1: Normalize the message API shape**

```ts
// Clint/src/api/messages.ts
export interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  sender: {
    id: string;
    nickname: string;
    avatar: string;
  };
  receiver: {
    id: string;
    nickname: string;
    avatar: string;
  };
  createdAt: string;
}
```

- [ ] **Step 2: Replace mock chat messages with REST requests**

```ts
// Clint/src/pages/chat/chat.vue
import { getChatMessages, sendMessage, markConversationRead } from '@/api/messages';

const otherUserId = ref('');

const loadMessages = async () => {
  const response = await getChatMessages(otherUserId.value, { page: 1, limit: 50 });
  messages.value = response.data.map((message) => ({
    id: message.id,
    content: message.content,
    time: formatTime(message.createdAt),
    isSelf: message.senderId === currentUserId.value,
  }));
  await markConversationRead(otherUserId.value);
  scrollToBottom();
};

const handleSend = async () => {
  if (!inputText.value.trim()) return;
  await sendMessage({
    content: inputText.value.trim(),
    receiverId: otherUserId.value,
    type: 'text',
  });
  inputText.value = '';
  await loadMessages();
};
```

- [ ] **Step 3: Run frontend type-check**

Run: `npm run type-check`
Expected: PASS in `Clint`.

- [ ] **Step 4: Commit**

```bash
git add Clint/src/api/messages.ts Clint/src/pages/chat/chat.vue
git commit -m "feat: connect chat page to message rest api"
```

### Task 10: Add Realtime Message Gateway and Client

**Files:**
- Create: `Server/src/modules/messages/messages.gateway.ts`
- Create: `Server/src/modules/messages/dto/socket-auth-payload.dto.ts`
- Create: `Clint/src/utils/chat-socket.ts`
- Modify: `Server/package.json`
- Modify: `Server/package-lock.json`
- Modify: `Server/src/main.ts`
- Modify: `Server/src/modules/messages/messages.module.ts`
- Modify: `Server/src/modules/messages/messages.service.ts`
- Modify: `Clint/src/pages/chat/chat.vue`
- Modify: `Clint/src/utils/request.ts`
- Test: `Server` build and `Clint` type-check

- [ ] **Step 1: Add the websocket dependency and gateway bootstrap**

```ts
// Server/package.json
"dependencies": {
  "ws": "^8.18.0"
},
"devDependencies": {
  "@types/ws": "^8.5.13"
}

// Server/src/modules/messages/messages.gateway.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IncomingMessage, Server as HttpServer } from 'http';
import { Server } from 'ws';
import WebSocket from 'ws';

@Injectable()
export class MessagesGateway {
  private server: Server | null = null;
  private clients = new Map<string, Set<WebSocket>>();

  constructor(private jwtService: JwtService) {}

  attach(httpServer: HttpServer) {
    if (this.server) {
      return;
    }

    this.server = new Server({ server: httpServer, path: '/ws/messages' });
    this.server.on('connection', (socket, request) => this.handleConnection(socket, request));
  }

  private handleConnection(socket: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url || '/ws/messages', 'http://localhost');
    const token = url.searchParams.get('token') || '';
    const payload = this.jwtService.verify(token);
    const userId = String(payload.sub);

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }

    this.clients.get(userId)!.add(socket);

    socket.on('close', () => {
      const bucket = this.clients.get(userId);
      bucket?.delete(socket);
      if (bucket && bucket.size === 0) {
        this.clients.delete(userId);
      }
    });
  }

  emitNewMessage(receiverId: string, payload: unknown) {
    const sockets = this.clients.get(receiverId) || new Set<WebSocket>();
    const message = JSON.stringify({ type: 'message:new', data: payload });
    sockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    });
  }
}

// Server/src/main.ts
await app.listen(process.env.PORT || 3000);
const httpServer = app.getHttpServer();
app.get(MessagesGateway).attach(httpServer);
```

- [ ] **Step 2: Emit from message creation**

```ts
// Server/src/modules/messages/messages.module.ts
providers: [MessagesService, MessagesGateway]

// Server/src/modules/messages/messages.service.ts
constructor(
  @InjectRepository(Message)
  private messagesRepository: Repository<Message>,
  private messagesGateway: MessagesGateway,
) {}

async create(senderId: string, createMessageDto: CreateMessageDto) {
  const message = this.messagesRepository.create({
    ...createMessageDto,
    senderId,
  });
  const saved = await this.messagesRepository.save(message);
  const full = await this.messagesRepository.findOne({
    where: { id: saved.id },
    relations: ['sender', 'receiver'],
  });
  this.messagesGateway.emitNewMessage(createMessageDto.receiverId, full);
  return full;
}
```

- [ ] **Step 3: Add the client socket utility**

```ts
// Clint/src/utils/chat-socket.ts
import { getSocketBaseUrl, getToken } from '@/utils/request';

let socketTask: UniNamespace.SocketTask | null = null;

export function connectChatSocket(onMessage: (data: any) => void) {
  if (socketTask) {
    return socketTask;
  }

  socketTask = uni.connectSocket({
    url: `${getSocketBaseUrl()}/ws/messages?token=${encodeURIComponent(getToken())}`,
  });

  socketTask.onMessage((event) => {
    const parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    onMessage(parsed);
  });

  socketTask.onClose(() => {
    socketTask = null;
    setTimeout(() => connectChatSocket(onMessage), 1500);
  });

  return socketTask;
}

export function closeChatSocket() {
  socketTask?.close({});
  socketTask = null;
}
```

- [ ] **Step 4: Insert realtime messages in the chat page**

```ts
// Clint/src/pages/chat/chat.vue
import { connectChatSocket, closeChatSocket } from '@/utils/chat-socket';
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  connectChatSocket((payload) => {
    if (payload?.type === 'message:new' && payload?.data?.senderId === otherUserId.value) {
      loadMessages();
    }
  });
  loadMessages();
});

onUnmounted(() => {
  closeChatSocket();
});
```

- [ ] **Step 5: Run backend build and frontend type-check**

Run: `npm run build`
Expected: PASS in `Server`.

Run: `npm run type-check`
Expected: PASS in `Clint`.

- [ ] **Step 6: Commit**

```bash
git add Server/src/modules/messages/messages.gateway.ts Server/src/modules/messages/messages.module.ts Server/src/modules/messages/messages.service.ts Clint/src/utils/chat-socket.ts Clint/src/pages/chat/chat.vue Clint/src/utils/request.ts
git commit -m "feat: add realtime chat delivery"
```

### Task 11: Final Verification and Test Guide Update

**Files:**
- Modify: `.claude/doc/TEST_GUIDE.md`
- Test: `Server` tests and build, `Clint` type-check

- [ ] **Step 1: Update the test guide to match the new flows**

```md
## 新增回归项

- [ ] 发布动态时上传 1 张和 3 张图片
- [ ] 首页点赞后刷新页面，状态仍正确
- [ ] 详情页收藏后返回列表，状态仍正确
- [ ] 用户主页关注后，详情页关注按钮同步
- [ ] 发表评论后评论数和评论列表同步
- [ ] 搜索关键词可返回动态、用户、资源
- [ ] 两个账号在线聊天时可实时收到新消息
```

- [ ] **Step 2: Run the full backend test suite**

Run: `npm test`
Expected: PASS in `Server`.

- [ ] **Step 3: Run the backend production build**

Run: `npm run build`
Expected: PASS in `Server`.

- [ ] **Step 4: Run the frontend type-check**

Run: `npm run type-check`
Expected: PASS in `Clint`.

- [ ] **Step 5: Commit**

```bash
git add .claude/doc/TEST_GUIDE.md
git commit -m "docs: update regression guide for social core"
```

## Self-Review

- Spec coverage:
- Task 1 covers post点赞/收藏幂等和状态返回。
- Task 2 covers resource收藏幂等和状态返回。
- Task 3 covers关注幂等、自关注校验、粉丝与关注列表修复、用户详情关注状态。
- Task 4 covers评论创建、删除、点赞、评论数同步和评论状态。
- Task 5 covers上传目录、上传接口验证、前端发布闭环。
- Task 6 covers统一搜索模块。
- Task 7 covers首页、详情页、用户主页真实状态接入。
- Task 8 covers搜索页真实查询。
- Task 9 covers聊天 REST 闭环。
- Task 10 covers WebSocket 实时消息推送与前端重连。
- Task 11 covers测试说明和最终验证。

- Placeholder scan:
- The plan avoids placeholder markers and delayed-action phrases.
- Each task includes exact files, concrete commands, and code snippets.

- Type consistency:
- Backend state keys are `isLiked`, `isCollected`, `isFollowing`.
- Like APIs return `liked` + `likesCount`.
- Collect APIs return `collected` + `collectionsCount`.
- Follow APIs return `following` + `followersCount` + `followingCount`.
