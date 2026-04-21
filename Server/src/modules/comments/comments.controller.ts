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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

@ApiTags('评论管理')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
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

  @Get('post/:postId')
  @ApiOperation({ summary: '获取动态评论列表' })
  findByPost(
    @Param('postId') postId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.commentsService.findByPost(
      postId,
      Number(page) || 1,
      Number(limit) || 20,
      this.getViewerId(req),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取评论详情' })
  findOne(
    @Param('id') id: string,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.commentsService.findOne(id, this.getViewerId(req));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建评论' })
  create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(req.user.id, createCommentDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新评论' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(req.user.id, id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  remove(@Request() req, @Param('id') id: string) {
    return this.commentsService.remove(req.user.id, id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞评论' })
  like(@Request() req, @Param('id') id: string) {
    return this.commentsService.like(req.user.id, id);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消点赞' })
  unlike(@Request() req, @Param('id') id: string) {
    return this.commentsService.unlike(req.user.id, id);
  }
}
