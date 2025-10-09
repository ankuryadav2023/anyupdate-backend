import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { frequencySettingsDto } from 'src/dto/scheduler.dto';

@Injectable()
export class SchedulerService {
    constructor(private schedulerRegistry: SchedulerRegistry) { }

    generateCronExpressionFromFrequencySettings(frequencySettings: frequencySettingsDto) {
        let cronExpressionArray = ['0', '*', '*', '*', '*', '*'];
        const dayOfWeekToNumber: { [key: string]: number } = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };
        // cronExpressionArray[1] = frequencySettings.endType === 'by' ? frequencySettings.startTime.split(':')[1] + '-' + frequencySettings.endTime.split(':')[1] : frequencySettings.startTime.split(':')[1] + '-59';
        // cronExpressionArray[2] = frequencySettings.endType === 'by' ? frequencySettings.startTime.split(':')[0] + '-' + frequencySettings.endTime.split(':')[0] : frequencySettings.startTime.split(':')[0] + '-23';
        // cronExpressionArray[3] = frequencySettings.endType === 'by' ? frequencySettings.startDate.split('-')[2] + '-' + frequencySettings.endDate.split('-')[2] : frequencySettings.startDate.split('-')[2] + '-';
        // cronExpressionArray[4] = frequencySettings.endType === 'by' ? frequencySettings.startDate.split('-')[1] + '-' + frequencySettings.endDate.split('-')[1] : frequencySettings.startDate.split('-')[1] + '-*';
        // cronExpressionArray[5] = frequencySettings.intervalType === 'weekly' ? dayOfWeekToNumber[frequencySettings.dayOfWeek].toString() : '*';

        // switch (frequencySettings.intervalType) {
        //     case 'hourly':
        //         cronExpressionArray[2] = cronExpressionArray[2] + '/' + frequencySettings.interval.toString();
        //         break;
        //     case 'daily':
        //         cronExpressionArray[3] = cronExpressionArray[3] + '/' + frequencySettings.interval.toString();
        //         break;
        //     case 'weekly':
        //         cronExpressionArray[5] = cronExpressionArray[5] + '/' + frequencySettings.interval.toString();
        //         break;
        //     case 'monthly':
        //         cronExpressionArray[4] = cronExpressionArray[4] + '/' + frequencySettings.interval.toString();
        //         break;
        // }
        // return cronExpressionArray.join(' ');

        cronExpressionArray[1] = frequencySettings.timeToRecieveNotification.split(':')[1];
        cronExpressionArray[2] = frequencySettings.timeToRecieveNotification.split(':')[0];
        switch (frequencySettings.intervalType) {
            case 'hourly':
                cronExpressionArray[1] =
                    cronExpressionArray[2] = '*';
                cronExpressionArray[2] = cronExpressionArray[2] + '/' + frequencySettings.interval.toString();
                break;
            case 'daily':
                cronExpressionArray[3] = cronExpressionArray[3] + '/' + frequencySettings.interval.toString();
                break;
            case 'weekly':
                cronExpressionArray[5] = dayOfWeekToNumber[frequencySettings.dayOfWeek].toString();
                cronExpressionArray[5] = cronExpressionArray[5] + '/' + frequencySettings.interval.toString();
                break;
            case 'monthly':
                cronExpressionArray[3] = frequencySettings.dayOfMonth.toString();
                cronExpressionArray[4] = cronExpressionArray[4] + '/' + frequencySettings.interval.toString();
                break;
        }
        return cronExpressionArray.join(' ');
    }

    calculateDelay(frequencySettings: frequencySettingsDto) {
        let startYear = Number(frequencySettings.startDate.split('-')[0]);
        let startMonth = Number(frequencySettings.startDate.split('-')[1]) - 1;
        let startDay = Number(frequencySettings.startDate.split('-')[2]);
        let startHour = Number(frequencySettings.startTime.split(':')[0]);
        let startMinute = Number(frequencySettings.startTime.split(':')[1]);
        let notificationHour = Number(frequencySettings.timeToRecieveNotification.split(':')[0]);
        let notificationMinute = Number(frequencySettings.timeToRecieveNotification.split(':')[1]);
        let currentDate = new Date();
        let startDate = new Date(startYear, startMonth, startDay, startHour, startMinute, 0);
        let delay = 0;

        const dayOfWeekToNumber: { [key: string]: number } = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        if (frequencySettings.intervalType === 'hourly') {
            if (startDate > currentDate) delay = startDate.getTime() - currentDate.getTime();
        }
        else if (frequencySettings.intervalType === 'daily') {
            if (startDate > currentDate) {
                let firstNotificationDate = new Date(startYear, startMonth, startDay, notificationHour, notificationMinute, 0);
                if (firstNotificationDate >= startDate) delay = firstNotificationDate.getTime() - currentDate.getTime();
                else {
                    firstNotificationDate.setDate(firstNotificationDate.getDate() + 1);
                    delay = firstNotificationDate.getTime() - currentDate.getTime();
                }
            } else {
                let currentYear = currentDate.getFullYear();
                let currentMonth = currentDate.getMonth();
                let currentDay = currentDate.getDate();
                let firstNotificationDate = new Date(currentYear, currentMonth, currentDay, notificationHour, notificationMinute, 0);
                if (firstNotificationDate >= currentDate) delay = firstNotificationDate.getTime() - currentDate.getTime();
                else {
                    firstNotificationDate.setDate(firstNotificationDate.getDate() + 1);
                    delay = firstNotificationDate.getTime() - currentDate.getTime();
                }
            }
        }
        else if (frequencySettings.intervalType === 'weekly') {
            let firstNotificationDate: Date;
            if (startDate >= currentDate) {
                firstNotificationDate = new Date(startDate);
                let startDateDayOfWeek = startDate.getDay();
                if (dayOfWeekToNumber[frequencySettings.dayOfWeek] >= startDateDayOfWeek) firstNotificationDate.setDate(firstNotificationDate.getDate() + (dayOfWeekToNumber[frequencySettings.dayOfWeek] - startDateDayOfWeek));
                else firstNotificationDate.setDate(firstNotificationDate.getDate() + ((6 - startDateDayOfWeek) + (dayOfWeekToNumber[frequencySettings.dayOfWeek]) + 1));
                firstNotificationDate.setHours(+frequencySettings.timeToRecieveNotification.split(':')[0]);
                firstNotificationDate.setMinutes(+frequencySettings.timeToRecieveNotification.split(':')[1]);
                if (dayOfWeekToNumber[frequencySettings.dayOfWeek] === startDateDayOfWeek) {
                    if (startDate > firstNotificationDate)
                        firstNotificationDate.setDate(firstNotificationDate.getDate() + 7);
                }
            } else {
                firstNotificationDate = new Date(currentDate);
                let currentDateDayOfWeek = currentDate.getDay();
                if (dayOfWeekToNumber[frequencySettings.dayOfWeek] >= currentDateDayOfWeek) firstNotificationDate.setDate(firstNotificationDate.getDate() + (dayOfWeekToNumber[frequencySettings.dayOfWeek] - currentDateDayOfWeek));
                else firstNotificationDate.setDate(firstNotificationDate.getDate() + ((6 - currentDateDayOfWeek) + (dayOfWeekToNumber[frequencySettings.dayOfWeek]) + 1));
                firstNotificationDate.setHours(+frequencySettings.timeToRecieveNotification.split(':')[0]);
                firstNotificationDate.setMinutes(+frequencySettings.timeToRecieveNotification.split(':')[1]);
                if (dayOfWeekToNumber[frequencySettings.dayOfWeek] === currentDateDayOfWeek) {
                    if (currentDate > firstNotificationDate)
                        firstNotificationDate.setDate(firstNotificationDate.getDate() + 7);
                }
            }
            delay = firstNotificationDate.getTime() - currentDate.getTime();
            console.log(firstNotificationDate)
        }
        else if (frequencySettings.intervalType === 'monthly') {
            const monthToDays = {
                0: 31,
                1: 28,
                2: 31,
                3: 30,
                4: 31,
                5: 30,
                6: 31,
                7: 31,
                8: 30,
                9: 31,
                10: 30,
                11: 31
            };
            let firstNotificationDate: Date;
            if (startDate >= currentDate) {
                firstNotificationDate = new Date(startDate);
                if (frequencySettings.dayOfMonth >= startDate.getDate()) firstNotificationDate.setDate(firstNotificationDate.getDate() + (frequencySettings.dayOfMonth - startDate.getDate()));
                else firstNotificationDate.setDate(firstNotificationDate.getDate() + (((monthToDays[startDate.getMonth()] - startDate.getDate()) + frequencySettings.dayOfMonth)));
                console.log(firstNotificationDate.getDate())
                console.log(startDate.getMonth())
                console.log(monthToDays[startDate.getMonth()])
                console.log((monthToDays[startDate.getMonth()] - startDate.getDate()))
                console.log(startDate.getDate())
                console.log(frequencySettings.dayOfMonth)
                firstNotificationDate.setHours(+frequencySettings.timeToRecieveNotification.split(':')[0]);
                firstNotificationDate.setMinutes(+frequencySettings.timeToRecieveNotification.split(':')[1]);
                if (firstNotificationDate < startDate) firstNotificationDate.setDate(firstNotificationDate.getDate() + ((monthToDays[firstNotificationDate.getMonth()] - firstNotificationDate.getDate()) + frequencySettings.dayOfMonth));
            } else {
                firstNotificationDate = new Date(currentDate);
                if (frequencySettings.dayOfMonth >= currentDate.getDate()) firstNotificationDate.setDate(firstNotificationDate.getDate() + (frequencySettings.dayOfMonth - currentDate.getDate()));
                else firstNotificationDate.setDate(firstNotificationDate.getDate() + (((monthToDays[startDate.getMonth()] - currentDate.getDate()) + frequencySettings.dayOfMonth)));
                firstNotificationDate.setHours(+frequencySettings.timeToRecieveNotification.split(':')[0]);
                firstNotificationDate.setMinutes(+frequencySettings.timeToRecieveNotification.split(':')[1]);
                if (firstNotificationDate < currentDate) firstNotificationDate.setDate(firstNotificationDate.getDate() + ((monthToDays[firstNotificationDate.getMonth()] - firstNotificationDate.getDate()) + frequencySettings.dayOfMonth));
            }
            console.log(firstNotificationDate)
            delay = firstNotificationDate.getTime() - currentDate.getTime();
        }
        return { delay }
    }
}
