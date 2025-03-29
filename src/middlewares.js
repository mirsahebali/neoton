import { logger } from "./logger.js";
import { getCookie } from "./session.js";
import { decodeJWT } from "./utils.js";

/**
 * @param {import("express").Request} req express request
 * @param {import("express").Response} res express response writer
 * @param {import("express").NextFunction} next -
 */
export async function ensureAuthenticated(req, res, next) {
  let email = req.body.email;

  if (!email) {
    logger.info("email not provided");
    res.status(401).send({ error: true, message: "unauthenticated user" });
    return;
  }

  /** @type {string} */
  let token = req.signedCookies["ACCESS_TOKEN"];

  if (!token) {
    logger.info("unauthenticated access");
    res.status(401).send({ error: true, message: "unauthenticated user" });
    return;
  }

  const claims = await decodeJWT(token);
  if (!claims) {
    logger.info("unauthenticated access");
    res.status(401).send({ error: true, message: "unauthenticated user" });
    return;
  }

  if (claims.email === email) {
    next();
  }

  next();
}
