import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('消息管理')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: '获取会话列表' })
  findConversations(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.messagesService.findConversations(req.user.id, page, limit);
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: '获取与某用户的聊天记录' })
  findConversation(
    @Request() req,
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.messagesService.findConversation(req.user.id, userId, page, limit);
  }

  @Post()
  @ApiOperation({ summary: '发送消息' })
  create(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(req.user.id, createMessageDto);
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记消息已读' })
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.messagesService.markAsRead(req.user.id, id);
  }

  @Put('conversation/:userId/read')
  @ApiOperation({ summary: '标记会话已读' })
  markConversationAsRead(@Request() req, @Param('userId') userId: string) {
    return this.messagesService.markConversationAsRead(req.user.id, userId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: '获取未读消息数' })
  getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.id);
  }
}
