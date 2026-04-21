import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

@ApiTags('资源管理')
@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly jwtService: JwtService,
  ) {}

  private getViewerId(req?: ExpressRequest & { user?: { id: string } }) {
    if (req?.user?.id) {
      return req.user.id;
    }

    const authorization = req?.headers?.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string }>(authorization.slice(7));
      return payload.sub;
    } catch {
      return undefined;
    }
  }

  @Get()
  @ApiOperation({ summary: '获取资源列表' })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('category') category?: string,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.resourcesService.findAll(page, limit, category, this.getViewerId(req));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建资源' })
  create(@Request() req, @Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(req.user.id, createResourceDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新资源' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(req.user.id, id, updateResourceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除资源' })
  remove(@Request() req, @Param('id') id: string) {
    return this.resourcesService.remove(req.user.id, id);
  }

  @Post(':id/collect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏资源' })
  collect(@Request() req, @Param('id') id: string) {
    return this.resourcesService.collect(req.user.id, id);
  }

  @Post(':id/uncollect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消收藏' })
  uncollect(@Request() req, @Param('id') id: string) {
    return this.resourcesService.uncollect(req.user.id, id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户资源列表' })
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.resourcesService.findByUser(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取资源详情' })
  findOne(
    @Param('id') id: string,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.resourcesService.findOne(id, this.getViewerId(req));
  }
}
