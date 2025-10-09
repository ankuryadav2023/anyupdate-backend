import { IsEnum, IsInt, IsISO8601, IsNumber, IsString, Matches, Max, Min } from "class-validator"

enum intervalType {
    HOURLY = 'hourly',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

enum dayOfWeek {
    SUNDAY = 'sunday',
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday'
}

enum endType {
    AFTER = 'after',
    BY = 'by',
    NEVER = 'never'
}

export class frequencySettingsDto {
    @IsEnum(intervalType)
    intervalType: intervalType

    @IsInt()
    @Min(1)
    interval: number

    @IsString()
    @IsISO8601()
    startDate: string

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Time must be in the format HH:MM',
    })
    startTime: string

    @IsEnum(dayOfWeek)
    dayOfWeek: dayOfWeek

    @IsInt()
    @Min(1)
    @Max(31)
    dayOfMonth: number

    @IsInt()
    @Min(1)
    @Max(12)
    monthOfYear: number

    @IsEnum(endType)
    endType: endType

    @IsNumber()
    @Min(1)
    noOfOccurences: number

    @IsString()
    @IsISO8601()
    endDate: string

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Time must be in the format HH:MM',
    })
    endTime: string

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Time must be in the format HH:MM',
    })
    timeToRecieveNotification: string
}