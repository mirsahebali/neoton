import { db } from "../../db.js";
import { usersTable } from "../../db/schema.js";
import { generateJWT, hashPassword } from "../../utils.js";
import { logger } from "../../logger.js";
import { IS_DEV_ENV } from "../../consts.js";
import { sendEmail } from "./email.js";
import { OTP } from "../../otp.js";
import { otpMap } from "../../server.js";
import { DrizzleError } from "drizzle-orm";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function registerHandler(req, res) {
  /** @type {string} */
  let email = req.body.email;
  if (!email) {
    res.status(400).send({ error: true, message: "Email is missing" });
    return;
  }

  email = email.toLowerCase();

  /** @type {string} */
  let username = req.body.username;
  if (!username) {
    res.status(400).send({ error: true, message: "Username is missing" });
    return;
  }

  /** @type {string | string[] | undefined} */
  let enabled2FA = req.body.enable_2fa;
  console.log("Enabled 2FA: ", enabled2FA);

  let is2FAEnabled = enabled2FA?.includes("on") || enabled2FA?.includes("true");

  /** @type {string} */
  let password = req.body.password;

  if (!password) {
    res.status(400).send({ error: true, message: "Password is missing" });
    return;
  }

  /** @type {typeof usersTable.$inferInsert} */
  const user = {
    username: username.toString(),
    email: email.toString(),
    enabled_2fa: is2FAEnabled,
    hashed_password: await hashPassword(password?.toString()),
  };

  let createdUser;
  try {
    createdUser = (await db.insert(usersTable).values(user).returning())[0];
  } catch (/** @type {any} */ err) {
    logger.error("ERROR creating user ");

    let e = /** @type {DrizzleError}*/ (err);
    logger.error(e.message);
    if (e.message.includes("SQLITE_CONSTRAINT_UNIQUE")) {
      res
        .status(417)
        .send({ error: true, message: "Username/Email already exists" });
      return;
    }

    res.status(500).send({ error: true, message: "Error creating user" });
    return;
  }

  const token = await generateJWT(
    /** @type {typeof usersTable.$inferInsert}*/ (createdUser),
  );

  if (!token) {
    res.status(500).send({
      error: true,
      message: `ERROR: generating token`,
    });
    logger.error("ERROR: jwt token is undefined");
    return;
  }

  if (createdUser.enabled_2fa === false) {
    logger.info("access token sent to user");
    res
      .cookie("ACCESS_TOKEN", token, {
        signed: true,
      })
      .status(200)
      .send({ error: false, message: "Redirect to chats", enabled2fa: false });
    return;
  }

  const otp = new OTP();
  otpMap[email] = otp;
  let isSuccess = sendEmail(createdUser.email, otp);
  if (!isSuccess) {
    res.status(500).send({ error: true, message: "error sending email" });
    return;
  }
  logger.info("Email sent to new user" + createdUser.email);
  res.status(200).send({
    error: false,
    message: "email sent successfully",
    enabled2FA: true,
  });
}
