import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
  ) {}

  async findAll(page = 1, limit = 20, category?: string) {
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
      data: resources,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const resource = await this.resourcesRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author'],
    });

    if (!resource) {
      throw new NotFoundException('资源不存在');
    }

    resource.viewsCount += 1;
    await this.resourcesRepository.save(resource);

    return resource;
  }

  async create(authorId: string, createResourceDto: CreateResourceDto) {
    const resource = this.resourcesRepository.create({
      ...createResourceDto,
      authorId,
    });

    return this.resourcesRepository.save(resource);
  }

  async update(userId: string, id: string, updateResourceDto: UpdateResourceDto) {
    const resource = await this.findOne(id);

    if (resource.authorId !== userId) {
      throw new ForbiddenException('无权限修改此资源');
    }

    Object.assign(resource, updateResourceDto);
    return this.resourcesRepository.save(resource);
  }

  async remove(userId: string, id: string) {
    const resource = await this.findOne(id);

    if (resource.authorId !== userId) {
      throw new ForbiddenException('无权限删除此资源');
    }

    resource.isDeleted = true;
    await this.resourcesRepository.save(resource);

    return { message: '删除成功' };
  }

  async collect(userId: string, resourceId: string) {
    const resource = await this.findOne(resourceId);
    resource.collectionsCount += 1;
    await this.resourcesRepository.save(resource);

    return { message: '收藏成功' };
  }

  async uncollect(userId: string, resourceId: string) {
    const resource = await this.findOne(resourceId);
    resource.collectionsCount = Math.max(0, resource.collectionsCount - 1);
    await this.resourcesRepository.save(resource);

    return { message: '取消收藏成功' };
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
      data: resources,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
