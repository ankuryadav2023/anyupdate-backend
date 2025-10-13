import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor('notifications-queue')
export class processNotifications extends WorkerHost {
    async process(job: Job) {
        console.log('Testing notifications job execution.')
    }
}