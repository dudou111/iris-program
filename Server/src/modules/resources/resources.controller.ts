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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('资源管理')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: '获取资源列表' })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('category') category?: string,
  ) {
    return this.resourcesService.findAll(page, limit, category);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取资源详情' })
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
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
}
