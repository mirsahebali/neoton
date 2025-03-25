import { IS_DEV_ENV } from "./consts.js";

/**
 *
 * @param {import("express").Request} req - request object
 * @param {string} key - key for the cookie
 *  @returns {string | undefined}
 */
export function getCookie(req, key) {
  if (IS_DEV_ENV) {
    console.log(req.signedCookies);
    return req.cookies[key];
  }
  return req.signedCookies[key];
}
