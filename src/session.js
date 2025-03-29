/**
 *
 * @param {import("express").Request} req - request object
 * @param {string} key - key for the cookie
 *  @returns {string | undefined}
 */
export function getCookie(req, key) {
  return req.signedCookies[key];
}
