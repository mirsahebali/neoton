import { eq } from "drizzle-orm";
import { db } from "../../db.js";
import { usersTable, userType } from "../../db/schema.js";
import { logger } from "../../logger.js";
import { otpMap } from "../../server.js";
import { getCookie } from "../../session.js";
import { decodeJWT, generateJWT } from "../../utils.js";
import { OTP } from "../../otp.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export const checkJWT = async (req, res) => {
  let accessToken = getCookie(req, "ACCESS_TOKEN");

  logger.info(req.ip + " accesssing access_token");
  if (!accessToken) {
    res.status(401).send({ error: true, message: "Unauthenticated user" });
    logger.error("Unauthenticated access");
    return;
  }
  let decodedClaims = await decodeJWT(accessToken);

  if (!decodedClaims) {
    res.status(401).send({ error: true, message: "Unauthenticated user" });
    logger.error("cannot decode claims");
    return;
  }

  res.status(200).send({ error: false });
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const verifyOTP = async (req, res) => {
  /** @type {{token: string | undefined, email: string | undefined}} */
  let { token, email } = req.body;

  if (!email) {
    logger.error("Email not found");

    res.status(500).send({ error: true, message: "Email not set" });
    return;
  }
  if (!token) {
    logger.error("Token not found");
    res.status(500).send({ error: true, message: "token not set" });

    return;
  }

  /** @type {OTP | undefined} */
  let otp = otpMap.get(email);

  if (!otp || !otp.isValid(token)) {
    console.log(otp);
    res.status(401).send({ error: true, message: "Invalid OTP" });
    otpMap.delete(email);
    return;
  }

  /** @type {typeof userType} */
  let user;
  try {
    let usr = await db
      .update(usersTable)
      .set({ is_verified: true })
      .where(eq(usersTable.email, email))
      .returning()
      .all();

    if (usr.length === 0) {
      res.status(500).send({ error: true, message: "User not found" });
      return;
    }

    user = usr[0];
  } catch (/** @type  {any}*/ err) {
    logger.error("DB ERROR: verifying user");
    logger.error(err);
    res.status(500).send({ error: true, message: "DB error" });
    return;
  }

  let accessToken = await generateJWT(user);

  logger.info("user " + email + " is verified");
  res
    .status(200)
    .cookie("ACCESS_TOKEN", accessToken, { signed: true })
    .send({ error: false, message: "User verified successfully" });
  otpMap.get(email);
  return;
};
