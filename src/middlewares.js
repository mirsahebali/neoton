import { logger } from "./logger.js";
import { decodeJWT } from "./utils.js";

/**
 * @param {import("express").Request} req express request
 * @param {import("express").Response} res express response writer
 * @param {import("express").NextFunction} next -
 */
export async function ensureAuthenticated(req, res, next) {
  /** @type {string | undefined} */
  let token = req.signedCookies["ACCESS_TOKEN"];

  if (token === undefined || token.length === 0) {
    logger.info("unauthenticated access");
    res.status(401).send({ error: true, message: "unauthenticated user" });
    return;
  }

  const claims = await decodeJWT(token);
  if (!claims) {
    logger.info("Error decoding claims");
    res.status(401).send({ error: true, message: "unauthenticated user" });
    return;
  }

  res.locals.email = claims.email;
  res.locals.id = claims.id;
  res.locals.username = claims.username;
  next();
}

/**
 * @param {import("express").Request} req express request
 * @param {import("express").Response} res express response writer
 * @param {import("express").NextFunction} next -
 */
export async function ensureUnauthenticated(req, res, next) {
  /** @type {string | undefined} */
  let token = req.signedCookies["ACCESS_TOKEN"];

  if (token) {
    logger.info("Authenticated access");
    res.status(401).send({ error: true, message: "authenticated user" });
    return;
  }

  next();
}
