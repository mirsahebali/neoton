import { db } from "../../db.js";
import { usersTable } from "../../db/schema.js";
import { generateJWT, hashPassword } from "../../utils.js";
import { logger } from "../../logger.js";
import { IS_DEV_ENV } from "../../consts.js";
import { sendEmail } from "./email.js";
import { OTP } from "../../otp.js";
import { otpMap } from "../../server.js";

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

  /** @type {string} */
  let username = req.body.username;
  if (!username) {
    res.status(400).send({ error: true, message: "Username is missing" });
    return;
  }

  /** @type {string} */
  let passwordEnabled = req.body.password_enabled;
  if (!passwordEnabled) {
    res
      .status(500)
      .send({ error: true, message: "Password enabling not specified" });
    return;
  }

  // INFO: convert this to actual boolean to pass it in ORM
  let isPasswordEnabled = passwordEnabled === "true";

  /** @type {string} */
  let password = req.body.password;
  if (isPasswordEnabled && !password) {
    res
      .status(500)
      .send({ error: true, message: "Password enabling not specified" });
    return;
  }

  /** @type {typeof usersTable.$inferInsert} */
  const user = {
    username: username.toString(),
    email: email.toString(),
    enabled_password: isPasswordEnabled,
    hashed_password: isPasswordEnabled
      ? await hashPassword(password?.toString() || "")
      : "",
  };

  let createdUser;
  try {
    const [userCreated] = await db.insert(usersTable).values(user).returning();
    createdUser = userCreated;
  } catch (/** @type {any} */ e) {
    logger.error("ERROR creating user ", e);
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

  if (!createdUser.enabled_password) {
    res
      .cookie("ACCESS_TOKEN", token, {
        signed: !IS_DEV_ENV,
        httpOnly: !IS_DEV_ENV,
        sameSite: IS_DEV_ENV ? "lax" : "strict",
      })
      .status(200)
      .redirect("/chats");
    return;
  }

  const otp = new OTP();
  otpMap[email] = otp;
  let isSuccess = sendEmail(createdUser.email, otp);
  if (!isSuccess) {
    res.status(500).send({ error: true, message: "error sending email " });
    return;
  }
  res.status(200).send({ error: false, messaeg: "email sent successfully" });
}
