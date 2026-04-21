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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

@ApiTags('动态管理')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
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
  @ApiOperation({ summary: '获取动态列表' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.postsService.findAll(
      Number(page) || 1,
      Number(limit) || 20,
      category,
      this.getViewerId(req),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建动态' })
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user.id, createPostDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新动态' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(req.user.id, id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除动态' })
  remove(@Request() req, @Param('id') id: string) {
    return this.postsService.remove(req.user.id, id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞动态' })
  like(@Request() req, @Param('id') id: string) {
    return this.postsService.like(req.user.id, id);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消点赞' })
  unlike(@Request() req, @Param('id') id: string) {
    return this.postsService.unlike(req.user.id, id);
  }

  @Post(':id/collect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏动态' })
  collect(@Request() req, @Param('id') id: string) {
    return this.postsService.collect(req.user.id, id);
  }

  @Post(':id/uncollect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消收藏' })
  uncollect(@Request() req, @Param('id') id: string) {
    return this.postsService.uncollect(req.user.id, id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户动态列表' })
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.postsService.findByUser(
      userId,
      Number(page) || 1,
      Number(limit) || 20,
      this.getViewerId(req),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取动态详情' })
  findOne(
    @Param('id') id: string,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.postsService.findOne(id, this.getViewerId(req));
  }
}
