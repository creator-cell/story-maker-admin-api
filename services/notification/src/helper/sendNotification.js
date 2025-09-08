import nodemailer from "nodemailer";
import twilio from "twilio";
import "dotenv/config";
import { renderFile } from "ejs";

const mailHelper = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendMailNotification = async (emails, subject, htmlBody) => {
    try {
        if (!emails || !subject || !htmlBody) {
            return {
                success: false,
                message: "required field are missing"
            }
        }

        let filterEmailArray = [];

        if (emails?.length > 499) {
            let fixEmails = [];
            emails.forEach(p => {
                if (fixEmails?.length == 499) {
                    filterEmailArray.push(fixEmails);
                    fixEmails = [];
                }
                fixEmails.push(p);
            });
            if (fixEmails?.length > 0) {
                filterEmailArray.push(fixEmails);
            }
        } else {
            filterEmailArray.push(emails);
        }

        filterEmailArray.map(async p => {
            await mailHelper.sendMail({
                from: process.env.EMAIL_FROM,
                to: "team@storymaker.com",
                bcc: p,
                subject: subject,
                html: htmlBody
            });
        });

        return {
            success: true,
            message: "Mail sended successfully"
        }
        
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

const sendSmsNotification = async (numbers, message) => {
    try {

        if (!numbers || !message) {
            return {
                success: false,
                message: "Missing required field"
            }
        }
        
        let successSms = 0;

        let result = [];

        numbers?.map(async p => {

            const currentResult = await client.messages.create({
                body: message,
                from: "+19016575093",
                to: p
            });

            result.push(currentResult);

        })

        return {
            success: true,
            successCount: successSms,
            result: result,
        }

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

export {
    sendMailNotification,
    sendSmsNotification,
    mailHelper
}