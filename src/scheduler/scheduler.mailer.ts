import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(body: string) {
    const { data, error } = await resend.emails.send({
        from: 'AnyUpdate <anyupdate@n8nify.site>',
        to: ['ankuryadav02.mail@gmail.com'],
        subject: 'Your scheduled notification is here🎉',
        html: body,
    });

    if (error) {
        return console.error({ error });
    }

    console.log({ data });
}