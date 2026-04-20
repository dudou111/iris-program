import { PartialType } from '@nestjs/swagger';
import { CreateActivityDto } from './create-activity.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @ApiProperty({ description: '活动状态', enum: ['upcoming', 'ongoing', 'ended', 'cancelled'], required: false })
  @IsOptional()
  @IsEnum(['upcoming', 'ongoing', 'ended', 'cancelled'])
  status?: string;
}
