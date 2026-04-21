import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesRealtimeService } from './messages.realtime.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), AuthModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRealtimeService,
    {
      provide: 'MESSAGES_REALTIME_SERVICE',
      useExisting: MessagesRealtimeService,
    },
  ],
  exports: [MessagesService, MessagesRealtimeService],
})
export class MessagesModule {}
