import { IsString, IsArray, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ description: '图片列表', required: false })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ description: '价格', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: '分类', enum: ['secondhand', 'study', 'lost', 'found', 'other'] })
  @IsEnum(['secondhand', 'study', 'lost', 'found', 'other'])
  category: string;

  @ApiProperty({ description: '位置', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '联系方式', required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ description: '所属圈子ID', required: false })
  @IsOptional()
  @IsString()
  circleId?: string;
}
