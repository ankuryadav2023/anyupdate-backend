import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { frequencySettingsDto } from 'src/dto/scheduler.dto';

@Controller('scheduler')
export class SchedulerController {
    constructor(private schedulerService: SchedulerService) { }

    @Post()
    async scheduleNotification(@Body(new ValidationPipe()) frequencySettings: frequencySettingsDto) {
        const delayForFirstNotification = this.schedulerService.calculateDelayForFirstNotification(frequencySettings);
        this.schedulerService.scheduleNotification(frequencySettings, delayForFirstNotification.delay);
        return { delay: delayForFirstNotification, success: true }
    }
}
