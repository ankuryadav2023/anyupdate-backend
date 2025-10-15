import { Module } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'path';
import { SchedulerProcessor } from './scheduler.processor';

console.log(join(__dirname, 'src/scheduler.js'))

@Module({
  imports: [ScheduleModule.forRoot(), BullModule.registerQueue({
    name: 'notifications-queue'
  })],
  controllers: [SchedulerController],
  providers: [SchedulerService, SchedulerProcessor]
})
export class SchedulerModule { }
