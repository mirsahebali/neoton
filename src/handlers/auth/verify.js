import { eq } from "drizzle-orm";
import { db } from "../../db.js";
import { usersTable } from "../../db/schema.js";
import { logger } from "../../logger.js";
import { otpMap } from "../../server.js";
import { getCookie } from "../../session.js";
import { decodeJWT, timeNow } from "../../utils.js";

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
  let { token, email } = req.body;

  let otp = otpMap[email];

  if (!otp.isValid(token)) {
    res.status(401).send({ error: true, message: "Invalid otp" });
    delete otpMap[email];
    return;
  }
  try {
    await db
      .update(usersTable)
      .set({ is_verified: true })
      .where(eq(usersTable.email, email));
  } catch (/** @type  {any}*/ err) {
    logger.error("DB ERROR: verifying user");
    logger.error(err);
    res.status(500).send({ error: true });
    return;
  }

  logger.info("user " + email + " is verified");
  res.status(200).send({ error: false, message: "User verified successfully" });
  delete otpMap[email];
  return;
};
