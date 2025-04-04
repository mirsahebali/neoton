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
import { ensureAuthenticated, ensureUnauthenticated } from "./middlewares.js";
import { createServer } from "http";
import cors from "cors";
import {
  getContacts,
  getInvites,
  getMessagesOfContact,
  getRequests,
  getUser,
} from "./handlers/db/users.js";
import { db } from "./db.js";
import { contactsTable, usersTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import { rateLimit } from "express-rate-limit";

const app = express();
const apiRouter = express.Router();
const dbRouter = express.Router();
const httpServer = createServer(app);
const io = new Server(httpServer, { allowUpgrades: true });

const PORT = 8080;

/** @type {Record<string, OTP>} */
export const otpMap = {};

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, "../web/dist")));
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET));

const limiter = rateLimit({
  windowMs: 15 * 60 * 100,
  limit: 300,
  message: { error: "Too many requests, please try again later" },
});
app.use(limiter);

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
apiRouter.post("/auth/login", ensureUnauthenticated, loginHandler);
apiRouter.post("/auth/register", ensureUnauthenticated, registerHandler);
apiRouter.post("/auth/resend-email", sendEmailHandler);
apiRouter.post("/auth/verify", verifyOTP);
apiRouter.post("/auth/check", checkJWT);

dbRouter.get("/user", ensureAuthenticated, getUser);
dbRouter.get("/user/contacts", ensureAuthenticated, getContacts);
dbRouter.get("/user/requests", ensureAuthenticated, getRequests);
dbRouter.get("/user/invites", ensureAuthenticated, getInvites);
dbRouter.get(
  "/user/messages/:username",
  ensureAuthenticated,
  getMessagesOfContact,
);

apiRouter.use("/db", dbRouter);
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
  return;
});

io.on("connection", (socket) => {
  socket.on("accept-invite", async ([currentUsername, senderUsername]) => {
    // error event name to send to the occoured user
    const errorEventName = `error:${currentUsername}`.trim();

    let currUsers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, currentUsername))
      .all();

    if (currUsers.length === 0) {
      logger.error("ERROR: getting current user");
      socket.emit(errorEventName, "ERROR: getting current user");
      return;
    }

    let senderUsers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, senderUsername))
      .all();

    if (senderUsers.length === 0) {
      logger.error("ERROR: getting sender user");
      socket.emit(errorEventName, "ERROR: getting sender user");
      return;
    }

    try {
      await db
        .update(contactsTable)
        .set({ request_accepted: true })
        .where(
          and(
            eq(contactsTable.recv_id, currUsers[0].id),
            eq(contactsTable.sender_id, senderUsers[0].id),
          ),
        );
    } catch (err) {
      logger.error("ERROR: updating user contacts");
      logger.error(err);

      socket.emit(errorEventName, "ERROR: updating user contacts");
      return;
    }

    const acceptSuccessEventName = `accept-success:${senderUsername}`;
    logger.info("emitting event: " + acceptSuccessEventName);
    socket.broadcast.emit(acceptSuccessEventName, currentUsername);
  });
  socket.on(
    "invite user",
    async (
      /** @type {[string, string]} */ [senderUsername, recieverUsername],
    ) => {
      const errorEventName = `error:${senderUsername}`.trim();
      // TODO: add invite to the user db
      try {
        const [senderId] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.username, senderUsername));

        const recvUser = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.username, recieverUsername))
          .all();

        // if not found send a signal to render a toast
        if (recvUser.length === 0) {
          logger.info("User not found");
          logger.error("Emitted event: " + errorEventName);
          socket.emit(errorEventName, "User not found");
          return;
        }

        await db.insert(contactsTable).values({
          sender_id: senderId.id,
          recv_id: recvUser[0].id,
          request_accepted: false,
        });
      } catch (err) {
        logger.info("Error occoured while inserting in db");
        // @ts-ignore
        logger.error(err.code);
        // @ts-ignore
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
          socket.emit(errorEventName, "Request already sent");
          return;
        }
      }

      socket.broadcast.emit(
        `invitation for ${recieverUsername}`,
        senderUsername,
      );
    },
  );
});

httpServer.listen(PORT, () => {
  logger.info(`Listening on Port:  http://localhost:${PORT}`);
});
