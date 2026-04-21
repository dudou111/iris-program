import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { User } from '../users/user.entity';
import { normalizeStringArray } from '../../common/utils/normalize-string-array';

@Injectable()
export class ResourcesService {
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

  private async findResourceEntity(id: string) {
    const resource = await this.resourcesRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author'],
    });

    if (!resource) {
      throw new NotFoundException('资源不存在');
    }

    return resource;
  }

  private decorateResource(resource: Resource, viewer?: User) {
    const normalizedImages = normalizeStringArray(resource.images);
    const normalizedTags = normalizeStringArray(resource.tags);
    return {
      ...resource,
      images: normalizedImages.length ? normalizedImages : null,
      tags: normalizedTags.length ? normalizedTags : null,
      isCollected:
        viewer?.collectedResources?.some((item) => item.id === resource.id) ?? false,
    };
  }

  async findAll(page = 1, limit = 20, category?: string, viewerId?: string) {
    const viewer = viewerId ? await this.findViewer(viewerId) : undefined;
    const query = this.resourcesRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.author', 'author')
      .where('resource.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('resource.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) {
      query.andWhere('resource.category = :category', { category });
    }

    const [resources, total] = await query.getManyAndCount();

    return {
      data: resources.map((resource) => this.decorateResource(resource, viewer)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, viewerId?: string) {
    const [resource, viewer] = await Promise.all([
      this.findResourceEntity(id),
      viewerId ? this.findViewer(viewerId) : Promise.resolve(undefined),
    ]);

    resource.viewsCount += 1;
    await this.resourcesRepository.save(resource);

    return this.decorateResource(resource, viewer);
  }

  async create(authorId: string, createResourceDto: CreateResourceDto) {
    const resource = this.resourcesRepository.create({
      ...createResourceDto,
      images: normalizeStringArray(createResourceDto.images),
      tags: normalizeStringArray(createResourceDto.tags),
      authorId,
    });

    return this.resourcesRepository.save(resource);
  }

  async update(userId: string, id: string, updateResourceDto: UpdateResourceDto) {
    const resource = await this.findResourceEntity(id);

    if (resource.authorId !== userId) {
      throw new ForbiddenException('无权限修改此资源');
    }

    Object.assign(resource, {
      ...updateResourceDto,
      images:
        updateResourceDto.images === undefined
          ? resource.images
          : normalizeStringArray(updateResourceDto.images),
      tags:
        updateResourceDto.tags === undefined
          ? resource.tags
          : normalizeStringArray(updateResourceDto.tags),
    });
    return this.resourcesRepository.save(resource);
  }

  async remove(userId: string, id: string) {
    const resource = await this.findResourceEntity(id);

    if (resource.authorId !== userId) {
      throw new ForbiddenException('无权限删除此资源');
    }

    resource.isDeleted = true;
    await this.resourcesRepository.save(resource);

    return { message: '删除成功' };
  }

  async collect(userId: string, resourceId: string) {
    const [viewer, resource] = await Promise.all([
      this.findViewer(userId),
      this.findResourceEntity(resourceId),
    ]);

    const collected = viewer.collectedResources.some((item) => item.id === resourceId);

    if (collected) {
      return {
        collected: true,
        collectionsCount: resource.collectionsCount,
        message: '已收藏',
      };
    }

    viewer.collectedResources.push(resource);
    resource.collectionsCount += 1;
    await this.usersRepository.save(viewer);
    await this.resourcesRepository.save(resource);

    return {
      collected: true,
      collectionsCount: resource.collectionsCount,
      message: '收藏成功',
    };
  }

  async uncollect(userId: string, resourceId: string) {
    const [viewer, resource] = await Promise.all([
      this.findViewer(userId),
      this.findResourceEntity(resourceId),
    ]);

    const collected = viewer.collectedResources.some((item) => item.id === resourceId);

    if (!collected) {
      return {
        collected: false,
        collectionsCount: resource.collectionsCount,
        message: '未收藏',
      };
    }

    viewer.collectedResources = viewer.collectedResources.filter(
      (item) => item.id !== resourceId,
    );
    resource.collectionsCount = Math.max(0, resource.collectionsCount - 1);
    await this.usersRepository.save(viewer);
    await this.resourcesRepository.save(resource);

    return {
      collected: false,
      collectionsCount: resource.collectionsCount,
      message: '取消收藏成功',
    };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const [resources, total] = await this.resourcesRepository.findAndCount({
      where: { authorId: userId, isDeleted: false },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: resources.map((resource) => this.decorateResource(resource)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
