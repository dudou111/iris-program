import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容' })
  @IsString()
  @MaxLength(500)
  content: string;

  @ApiProperty({ description: '动态ID' })
  @IsString()
  postId: string;

  @ApiProperty({ description: '父评论ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '回复的用户ID', required: false })
  @IsOptional()
  @IsString()
  replyToUserId?: string;
}
