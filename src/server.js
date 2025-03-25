import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { loginHandler } from "./handlers/auth/login.js";
import { registerHandler } from "./handlers/auth/register.js";
import cookieParser from "cookie-parser";
import { stat } from "fs";
import "dotenv/config";
import { checkJWT } from "./handlers/auth/verify.js";
import { IS_DEV_ENV } from "./consts.js";
import cors from "cors";
import { OTP } from "./otp.js";

const app = express();
const PORT = 8080;

/** @type {Record<string, OTP>} */
export const otpMap = {};

/** @type {import("cors").CorsOptions} */
const corsOptions = {
  origin: [IS_DEV_ENV && "http://localhost:5173"],
};

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, "../web/dist"))); // ./web/dist
app.use(cors(corsOptions));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/foo/test", (req, res) => {
  res.send({ foo: "hello" });
});

app.post("/api/auth/login", loginHandler);

app.post("/api/auth/register", registerHandler);
app.post("/api/auth/verify", checkJWT);

app.get("/*", (req, res) => {
  stat(path.join(import.meta.dirname, "../web/dist", "index.html"), (err) => {
    if (err) {
      res.status(500).send({ error: true, message: "Internal server error" });
      return;
    }
  });
  res.sendFile(path.join(import.meta.dirname, "../web/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on Port:  ${PORT}`);
});
