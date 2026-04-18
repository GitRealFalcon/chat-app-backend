import { otpEmail } from "../emails/otpEmail.js";
import { resend } from "../lib/resend.js";


export const sendVerificationCode = async(otp, email, name)=>{
    try {
        if (!resend) {
            console.log("RESEND_API_KEY is missing. Email service is disabled.");
            return { success: false, message: "Email service is not configured" }
        }

        await resend.emails.send({
            from: 'Chattify <no-reply@updates.realfalcon.in>',
            to: email,
            subject: 'Chattify | Verification Code',
            html: otpEmail(otp, name),
        });
        return { success: true, message: "Verification Email send Successfully" }
    } catch (EmailError) {
        console.log("Error sending verification Email", EmailError);
        return { success: false, message: "Failed to send verification Email" }
    }
}