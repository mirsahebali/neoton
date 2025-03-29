import { db } from "../../db.js";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { logger } from "../../logger.js";
import { comparePasword, generateJWT } from "../../utils.js";
import { sendEmail } from "./email.js";
import { OTP } from "../../otp.js";
import { otpMap } from "../../server.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function loginHandler(req, res) {
  /** @type {string | undefined} */
  let email = req.body.email;
  if (!email) {
    logger.error("user email not specified");
    res.status(401).send({ error: true });
    return;
  }

  /** @type {string} */
  let password = req.body.password;
  if (!password) {
    logger.error("pasword not specified");
    res.status(401).send({ error: true, message: "Password not specified" });
    return;
  }

  /** @type {(typeof usersTable.$inferSelect) | undefined} */
  let user;
  try {
    const [userDb] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    user = userDb;
    logger.info(`found user ${email}`);
  } catch (/** @type {any}*/ e) {
    logger.error(`ERROR: querying user with email: ${email}`, e);
    res.status(404).send({ error: true, message: "user not  found" });
    return;
  }

  const isValid = await comparePasword(password, user.hashed_password);

  if (!isValid) {
    logger.warn("Unauthenticated access to user", user.email);
    res.status(401).send({ error: true, message: "Invalid user" });
    return;
  }

  const token = await generateJWT(user);

  if (!token) {
    logger.error("cannot generate token");
    res.status(500).send({ error: true, message: "Internal server error" });
    return;
  }

  if (user.enabled_2fa) {
    let otp = new OTP();
    otpMap[email] = otp;
    let isSuccess = await sendEmail(email, otp);

    if (!isSuccess) {
      logger.error("ERROR sending OTP to email" + email);
      res.status(500).send({ error: true, message: "Error sending OTP" });
      return;
    }

    logger.info("Email sent successfully");
    res.status(200).send({
      enabled2fa: true,
      error: false,
      message: "Email sent successfully",
    });
    return;
  }

  logger.info("User is authenticated");
  res
    .status(200)
    .cookie("ACCESS_TOKEN", token, {
      signed: true,
      sameSite: true,
      httpOnly: true,
    })
    .send({
      error: false,
      enabled2fa: false,
      message: "User is authenticated",
    });
  return;
}
