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
import { CirclesService } from './circles.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('圈子管理')
@Controller('circles')
export class CirclesController {
  constructor(private readonly circlesService: CirclesService) {}

  @Get()
  @ApiOperation({ summary: '获取圈子列表' })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('category') category?: string,
  ) {
    return this.circlesService.findAll(page, limit, category);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取圈子详情' })
  findOne(@Param('id') id: string) {
    return this.circlesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建圈子' })
  create(@Request() req, @Body() createCircleDto: CreateCircleDto) {
    return this.circlesService.create(req.user.id, createCircleDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新圈子' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCircleDto: UpdateCircleDto,
  ) {
    return this.circlesService.update(req.user.id, id, updateCircleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除圈子' })
  remove(@Request() req, @Param('id') id: string) {
    return this.circlesService.remove(req.user.id, id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '加入圈子' })
  join(@Request() req, @Param('id') id: string) {
    return this.circlesService.join(req.user.id, id);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出圈子' })
  leave(@Request() req, @Param('id') id: string) {
    return this.circlesService.leave(req.user.id, id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: '获取圈子成员列表' })
  getMembers(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.circlesService.getMembers(id, page, limit);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: '获取圈子活动列表' })
  getActivities(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.circlesService.getActivities(id, page, limit);
  }

  @Get(':id/resources')
  @ApiOperation({ summary: '获取圈子资源列表' })
  getResources(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.circlesService.getResources(id, page, limit);
  }
}
