import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Circle } from './circle.entity';
import { CirclesService } from './circles.service';
import { CirclesController } from './circles.controller';
import { Activity } from '../activities/activity.entity';
import { Resource } from '../resources/resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Circle, Activity, Resource])],
  controllers: [CirclesController],
  providers: [CirclesService],
  exports: [CirclesService],
})
export class CirclesModule {}
