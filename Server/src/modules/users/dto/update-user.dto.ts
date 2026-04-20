import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '学校', required: false })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({ description: '学院', required: false })
  @IsOptional()
  @IsString()
  college?: string;

  @ApiProperty({ description: '专业', required: false })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiProperty({ description: '年级', required: false })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ description: '个性签名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
}
