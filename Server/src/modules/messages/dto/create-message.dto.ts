import { IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: '消息内容' })
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiProperty({ description: '接收者ID' })
  @IsString()
  receiverId: string;

  @ApiProperty({ description: '消息类型', enum: ['text', 'image', 'system'], default: 'text' })
  @IsEnum(['text', 'image', 'system'])
  type: string;
}
