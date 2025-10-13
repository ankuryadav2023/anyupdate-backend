import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulerModule } from './scheduler/scheduler.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [SchedulerModule, BullModule.forRoot({
    connection: {
      url: 'rediss://default:AVNS_rarS09NxP78V4G9LL5R@valkey-14c4588d-aymwgaming21-fe34.b.aivencloud.com:13649'
    },
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
