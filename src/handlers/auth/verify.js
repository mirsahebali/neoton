import { logger } from "../../logger.js";
import { otpMap } from "../../server.js";
import { getCookie } from "../../session.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const checkJWT = async (req, res) => {
  let accessToken = getCookie(req, "ACCESS_TOKEN");
  logger.info(req.hostname + " accesssing accesstoken");
  res.send({ error: !accessToken, token: accessToken });
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const checkOTP = async (req, res) => {
  let { token, email } = req.body;

  let otp = otpMap[email];

  if (!otp.isValid(token)) {
    res.status(401).send({ error: true, message: "Invalid otp" });
    delete otpMap[email];
    return;
  }
};
