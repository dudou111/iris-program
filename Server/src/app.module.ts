import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { CirclesModule } from './modules/circles/circles.module';
import { CommentsModule } from './modules/comments/comments.module';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    ResourcesModule,
    ActivitiesModule,
    CirclesModule,
    CommentsModule,
    MessagesModule,
  ],
})
export class AppModule {}
