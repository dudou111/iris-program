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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('活动管理')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: '获取活动列表' })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.activitiesService.findAll(page, limit, category, status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取活动详情' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建活动' })
  create(@Request() req, @Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.create(req.user.id, createActivityDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新活动' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(req.user.id, id, updateActivityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除活动' })
  remove(@Request() req, @Param('id') id: string) {
    return this.activitiesService.remove(req.user.id, id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '报名活动' })
  join(@Request() req, @Param('id') id: string) {
    return this.activitiesService.join(req.user.id, id);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消报名' })
  leave(@Request() req, @Param('id') id: string) {
    return this.activitiesService.leave(req.user.id, id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户活动列表' })
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.activitiesService.findByUser(userId, page, limit);
  }
}
