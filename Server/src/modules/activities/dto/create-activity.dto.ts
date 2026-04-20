import { IsString, IsArray, IsOptional, IsEnum, IsNumber, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({ description: '活动标题' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: '活动描述' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ description: '图片列表', required: false })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ description: '活动分类', enum: ['lecture', 'competition', 'party', 'sports', 'other'] })
  @IsEnum(['lecture', 'competition', 'party', 'sports', 'other'])
  category: string;

  @ApiProperty({ description: '活动地点' })
  @IsString()
  location: string;

  @ApiProperty({ description: '开始时间' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({ description: '结束时间' })
  @IsDateString()
  endTime: Date;

  @ApiProperty({ description: '最大参与人数', required: false })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}
