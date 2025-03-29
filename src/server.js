import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { loginHandler } from "./handlers/auth/login.js";
import { registerHandler } from "./handlers/auth/register.js";
import cookieParser from "cookie-parser";
import { stat } from "fs";
import "dotenv/config";
import { verifyOTP, checkJWT } from "./handlers/auth/verify.js";
import { OTP } from "./otp.js";
import { sendEmailHandler } from "./handlers/auth/email.js";
import { logger } from "./logger.js";
import { Server } from "socket.io";
import { ensureAuthenticated } from "./middlewares.js";
import { createServer } from "http";

const app = express();
const apiRouter = express.Router();
const httpServer = createServer(app);
const io = new Server(httpServer, { allowUpgrades: true });

const PORT = 8080;

/** @type {Record<string, OTP>} */
export const otpMap = {};

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, "../web/dist")));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ping test routes
apiRouter.get("/ping", (req, res) => {
  logger.info("Pinged");
  res.send({
    one: "Your outie is nurturing",
    two: "Your outie loves to debug untyped JS stack traces",
    three: "Your outies loves to get undefined messages in logs",
  });
});

// auth routes
apiRouter.post("/auth/login", loginHandler);
apiRouter.post("/auth/register", registerHandler);
apiRouter.post("/auth/resend-email", sendEmailHandler);
apiRouter.post("/auth/verify", verifyOTP);
apiRouter.post("/auth/check", checkJWT);

app.use("/api", apiRouter);

app.get("/*", (req, res) => {
  logger.info("IP: " + req.ip);
  stat(path.join(import.meta.dirname, "../web/dist", "index.html"), (err) => {
    if (err) {
      res.status(500).send({ error: true, message: "Internal server error" });
      return;
    }
  });
  res.sendFile(path.join(import.meta.dirname, "../web/dist", "index.html"));
});

io.on("connection", (socket) => {
  socket.on(
    "invite user",
    (/** @type {[string, string]} */ [inviter, invitee]) => {
      logger.info("User " + inviter + " invited");
      logger.info("User " + invitee + " was invited");
    },
  );
});

httpServer.listen(PORT, () => {
  logger.info(`Listening on Port:  http://localhost:${PORT}`);
});
