import { randomInt } from "crypto";
import { timeNow } from "./utils.js";

const EXP_TIME = 5 * 60 * 100;

export class OTP {
  /** @type {number} */
  createdAt;

  /** @type {number} */
  token;

  constructor() {
    this.createdAt = timeNow();
    this.token = randomInt(999999);
  }
  isExpired() {
    return this.createdAt + EXP_TIME >= timeNow();
  }

  /**
   * @param {string} userToken
   * @returns {boolean}
   */
  isMatch(userToken) {
    return userToken === String(this.token);
  }

  /**
   * @param {string} userToken
   * @returns {boolean}
   */
  isValid(userToken) {
    return this.isMatch(userToken) && !this.isExpired();
  }
}
