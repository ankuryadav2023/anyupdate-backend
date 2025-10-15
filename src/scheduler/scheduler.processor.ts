import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { researcherAgent } from "./scheduler.agent";
import { sendEmail } from "./scheduler.mailer";

@Processor('notifications-queue')
export class SchedulerProcessor extends WorkerHost {
    async process(job: Job) {
        console.log(job.data);
        console.log('Testing notifications job execution.')
        const response = await researcherAgent('Reasearch about E20 fuel in India.')
        if (response) await sendEmail(response.toString());
    }
}