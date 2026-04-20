import { IsString, IsArray, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCircleDto {
  @ApiProperty({ description: '圈子名称' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '圈子描述' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '封面', required: false })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ description: '类型', enum: ['public', 'private'], default: 'public' })
  @IsOptional()
  @IsEnum(['public', 'private'])
  type?: string;

  @ApiProperty({ description: '分类', enum: ['study', 'sports', 'art', 'tech', 'other'] })
  @IsEnum(['study', 'sports', 'art', 'tech', 'other'])
  category: string;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
