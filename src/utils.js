import bcrypt from "bcrypt";
import { JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, SALT_ROUNDS } from "./consts.js";
import { usersTable } from "./db/schema.js";
import jwt from "jsonwebtoken";

/**
 * @typedef {typeof usersTable.$inferInsert & { iat: number, exp: number}} UserClaims
 */

/**
 * @param {number} length - length of the string to generate
 * @returns {string} - randomly(pseudo) generated string
 */
export function generateUniqueString(length = 12) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueString += characters[randomIndex];
  }

  return uniqueString;
}
/**
 * @param {string} password -  takes a plain text password
 * @returns {Promise<string>} - hashed password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * @param {string} password -  takes a plain text password
 * @param {string} hashedPassword -  takes a plain text password
 * @returns {Promise<boolean>} - hashed password
 */
export async function comparePasword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * @returns {number} - returns current time in millis since unix epoch
 */
export function timeNow() {
  return Math.floor(new Date().getTime() / 1000);
}
/**
 * @param {typeof usersTable.$inferInsert} claims -
 * @returns {Promise<string | undefined>} - signed jwt token
 */
export async function generateJWT(claims) {
  if (!JWT_PRIVATE_KEY) throw new Error("JWT_PRIVATE_KEY no set");

  const nowUnixEpoch = timeNow();

  // 7 days in millis
  const exp = nowUnixEpoch + 7 * 24 * 60 * 60 * 100;

  const token = jwt.sign(
    { ...claims, iat: nowUnixEpoch, exp },
    JWT_PRIVATE_KEY,
    {
      algorithm: "RS256",
    },
  );
  return token;
}

/**
 * @param {string} token - jwt token to be decoded back to claims
 * @returns {Promise<UserClaims | undefined>}
 */
export async function decodeJWT(token) {
  if (!JWT_PUBLIC_KEY) throw new Error("JWT_PRIVATE_KEY no set");

  let claims;
  jwt.verify(token, JWT_PUBLIC_KEY),
    (/** @type {any} */ err, /** @type {UserClaims}*/ decoded) => {
      if (err) {
        console.error(err);
        return;
      }
      claims = decoded;
    };

  return claims;
}
