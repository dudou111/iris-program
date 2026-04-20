import { IsString, IsArray, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: '动态内容' })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiProperty({ description: '图片列表', required: false })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ description: '位置', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: '可见范围', enum: ['public', 'friends', 'private'], default: 'public' })
  @IsOptional()
  @IsEnum(['public', 'friends', 'private'])
  visibility?: string;

  @ApiProperty({ description: '分类', enum: ['all', 'study', 'life', 'activity', 'confession'], default: 'all' })
  @IsOptional()
  @IsEnum(['all', 'study', 'life', 'activity', 'confession'])
  category?: string;
}
