import { transporter } from "../../email-transport.js";
import { logger } from "../../logger.js";
import { OTP } from "../../otp.js";
import { otpMap } from "../../server.js";

/**
 * @param {string} email recipient
 * @param {OTP} otp to send
 * @returns {Promise<boolean>} if the request was success
 */
export async function sendEmail(email, otp) {
  let sentInfo;
  try {
    const info = await transporter.sendMail({
      to: email,
      subject: "OTP for neolink auth",
      html: `<h3> Your OTP for neolink session is </h3> 
            <b> <i> ${otp.token}</b></i>
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

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function sendEmailHandler(req, res) {
  let { email } = req.body;
  const otp = new OTP();
  otpMap[email] = otp;
  let isSuccess = sendEmail(email, otp);
  if (!isSuccess) {
    res.status(500).send({ error: true, message: "error sending email " });
    return;
  }
  res.status(200).send({ error: false, messaeg: "email sent successfully" });
}
