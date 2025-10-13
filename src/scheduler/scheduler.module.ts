import { Module } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'path';

console.log(join(__dirname, 'src/scheduler.js'))

@Module({
  imports: [ScheduleModule.forRoot(), BullModule.registerQueue({
    name: 'notifications-queue',
    processors: [join(__dirname, 'scheduler')]
  })],
  controllers: [SchedulerController],
  providers: [SchedulerService]
})
export class SchedulerModule { }
