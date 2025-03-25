import { StatusCodes } from "http-status-codes";
import { db } from "../../db.js";
import { usersTable } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";
import { logger } from "../../logger.js";
import { generateJWT } from "../../utils.js";

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
  let passwordEnabled = req.body.password_enabled;
  if (!passwordEnabled) {
    logger.info("Password enabling not specified");
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
    logger.error("pasword not specified");
    res.status(401).send({ error: true, message: "Password not specified" });
    return;
  }

  /** @type {typeof usersTable.$inferSelect} */
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
  const token = await generateJWT(user);

  if (!token) {
    logger.error("cannot generate token");
    res.send(500).send({ error: true, message: "Internal server error" });
    return;
  }

  res
    .send(200)
    .cookie("ACCESS_TOKEN", token)
    .send({ error: false, message: "session created" });
}
