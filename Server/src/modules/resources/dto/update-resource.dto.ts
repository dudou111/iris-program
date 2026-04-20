import { PartialType } from '@nestjs/swagger';
import { CreateResourceDto } from './create-resource.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
  @ApiProperty({ description: '状态', enum: ['available', 'sold', 'closed'], required: false })
  @IsOptional()
  @IsEnum(['available', 'sold', 'closed'])
  status?: string;
}
