import { transporter } from "../../email-transport.js";
import { logger } from "../../logger.js";
import { OTP } from "../../otp.js";

/**
 * @param {string} email recipient
 * @param {OTP} otp to send
 * @returns {Promise<boolean>} if the request was success
 */
export async function sendEmail(email, otp) {
  let sentInfo;
  try {
    const info = await transporter.sendMail({
      from: `"The Neolink Team 🔒" <${process.env.SMTP_EMAIL_USERNAME}>`, // sender address
      to: email,
      subject: "OTP for neolink auth",
      html: `<h3> Your OTP for neolink session is </h3> 
            <button>${otp.token}</button>
            <b>It will expire in 5 minuets</b>`,
    });
    sentInfo = info;
  } catch (/** @type {any} */ e) {
    logger.error(`error sending mail to ${email}`);
    logger.error(e);
    return false;
  }

  logger.info("Email sent successfully to: " + email);
  logger.info(sentInfo);

  return true;
}
