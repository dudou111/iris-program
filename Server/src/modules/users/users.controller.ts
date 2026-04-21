import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
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
  @ApiOperation({ summary: '获取用户列表' })
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.usersService.findAll(page, limit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id, req.user.id);
  }

  @Get('me/collections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户收藏列表' })
  getMyCollections(@Request() req) {
    return this.usersService.getCollections(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  findOne(
    @Param('id') id: string,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.usersService.findOne(id, this.getViewerId(req));
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新当前用户信息' })
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '关注用户' })
  follow(@Request() req, @Param('id') id: string) {
    return this.usersService.follow(req.user.id, id);
  }

  @Post(':id/unfollow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消关注' })
  unfollow(@Request() req, @Param('id') id: string) {
    return this.usersService.unfollow(req.user.id, id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: '获取粉丝列表' })
  getFollowers(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.usersService.getFollowers(id, page, limit, this.getViewerId(req));
  }

  @Get(':id/following')
  @ApiOperation({ summary: '获取关注列表' })
  getFollowing(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req?: ExpressRequest & { user?: { id: string } },
  ) {
    return this.usersService.getFollowing(id, page, limit, this.getViewerId(req));
  }
}
