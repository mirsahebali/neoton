import { and, eq, or } from "drizzle-orm";
import { db } from "../../db.js";
import { contactsTable, messageTable, usersTable } from "../../db/schema.js";
import { logger } from "../../logger.js";

/**
 * @param {import("express").Request} req -
 * @param {import("express").Response} res -
 */
export async function getUser(req, res) {
  let email = res.locals.email;
  if (!email) {
    logger.error("email not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  /** @type { {email: string, username: string, id: number, is_verified: boolean | null} | undefined} */
  let user;
  try {
    user = (
      await db
        .select({
          username: usersTable.username,
          email: usersTable.email,
          id: usersTable.id,
          is_verified: usersTable.is_verified,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email))
    ).at(0);
  } catch (e) {
    logger.error("Error getting the user details with email " + email);
    logger.error(e);
    res.status(404).send({ error: true, message: "Error getting user" });
    return;
  }

  if (!user) {
    logger.error("Error getting the user details with email " + email);
    logger.error("user not found but no db error");
    res.status(404).send({ error: true, message: "Error getting user" });
    return;
  }

  res.status(200).send(user);
}

/**
 * @param {import("express").Request} req -
 * @param {import("express").Response} res -
 */
export async function getContacts(req, res) {
  /** @type {string} */
  const email = res.locals.email;
  /** @type {number} */
  const id = res.locals.id;

  if (!email) {
    logger.error("email not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  if (!id) {
    logger.error("id not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  let userContacts;
  try {
    console.log("ID ", id);
    let ct = await db
      .selectDistinct({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
      })
      .from(contactsTable)
      .innerJoin(
        usersTable,
        or(
          eq(usersTable.id, contactsTable.recv_id),
          eq(usersTable.id, contactsTable.sender_id),
        ),
      )
      .where(
        and(
          eq(contactsTable.request_accepted, true),
          or(eq(contactsTable.recv_id, id), eq(contactsTable.sender_id, id)),
        ),
      )
      .orderBy(usersTable.username);
    userContacts = ct;
  } catch (error) {
    // @ts-ignore
    if (error.code === "SQLITE_NOTFOUND") {
      logger.error("email not found in locals");
      res.status(404).send({ error: true, message: "user not found" });
      return;
    }
  }
  console.log(userContacts);

  res.status(200).send(userContacts);
}

/**
 * @param {import("express").Request} req -
 * @param {import("express").Response} res -
 */

export async function getInvites(req, res) {
  /** @type {string} */
  const email = res.locals.email;
  /** @type {number} */
  const id = res.locals.id;

  if (!email) {
    logger.error("email not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  if (!id) {
    logger.error("id not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  let userInvites;
  try {
    console.log("Recv id", id);
    let res = await db
      .select({
        sender_id: contactsTable.sender_id,
        sender_email: usersTable.email,
        sender_username: usersTable.username,
      })
      .from(contactsTable)
      .innerJoin(usersTable, eq(usersTable.id, contactsTable.sender_id))
      .where(
        and(
          eq(contactsTable.request_accepted, false),
          eq(contactsTable.recv_id, id),
        ),
      )
      .all();
    userInvites = res;
  } catch (error) {
    // @ts-ignore
    if (error.code === "SQLITE_NOTFOUND") {
      logger.error("email not found in locals");
      res.status(404).send({ error: true, message: "user not found" });
      return;
    }
  }
  console.log(userInvites);

  res.status(200).send(userInvites);
}

/**
 * @param {import("express").Request} req -
 * @param {import("express").Response} res -
 */
export async function getRequests(req, res) {
  /** @type {string | undefined} */
  const email = res.locals.email;

  /** @type {number | undefined} */
  const id = res.locals.id;

  if (!email) {
    logger.error("email not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  if (!id) {
    logger.error("id not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  let userRequests;
  try {
    console.log("requester id", id);
    let res = await db
      .select({
        recv_id: usersTable.id,
        recv_email: usersTable.email,
        recv_username: usersTable.username,
      })
      .from(contactsTable)
      .innerJoin(usersTable, eq(usersTable.id, contactsTable.recv_id))
      .where(
        and(
          eq(contactsTable.sender_id, id),
          eq(contactsTable.request_accepted, false),
        ),
      )
      .all();
    userRequests = res;
  } catch (error) {
    // @ts-ignore
    if (error.code === "SQLITE_NOTFOUND") {
      logger.error("email not found in locals");
      res.status(404).send({ error: true, message: "user not found" });
      return;
    }
  }

  console.log(userRequests);

  res.status(200).send(userRequests);
}

/**
 * @param {import("express").Request} req -
 * @param {import("express").Response} res -
 */
export async function getMessagesOfContact(req, res) {
  const id = res.locals.id;
  const username = req.params.username;
  const [reciever] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username));

  let messages;
  try {
    messages = await db
      .select()
      .from(messageTable)
      .where(
        or(
          and(
            eq(messageTable.sent_by, id),
            eq(messageTable.recv_by, reciever.id),
          ),
          and(
            eq(messageTable.recv_by, id),
            eq(messageTable.sent_by, reciever.id),
          ),
        ),
      )
      .all();
  } catch (error) {
    console.error(error);
    logger.error("ERROR: getting messages table");
    res.status(500).send({ error: true, message: "ERROR: getting messages" });
    return;
  }
  res.status(200).send(messages);
}

/**
 * @param {import("express").Request} req -
 * @param {import("express").Response} res -
 */
export async function getLastMessageOfContactsWithContacts(req, res) {
  /** @type {string} */
  const email = res.locals.email;
  /** @type {number} */
  const id = res.locals.id;

  if (!email) {
    logger.error("email not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  if (!id) {
    logger.error("id not found in locals");
    res.status(401).send({ error: true, message: "unauthorized access" });
    return;
  }

  let userContacts;
  try {
    console.log("ID ", id);
    let ct = await db
      .selectDistinct({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
        lastMessage: messageTable.content,
      })
      .from(contactsTable)
      .innerJoin(
        usersTable,
        or(
          eq(usersTable.id, contactsTable.recv_id),
          eq(usersTable.id, contactsTable.sender_id),
        ),
      )
      .innerJoin(
        messageTable,
        or(
          eq(messageTable.recv_by, contactsTable.recv_id),
          eq(messageTable.sent_by, contactsTable.recv_id),
        ),
      )
      .where(
        and(
          eq(contactsTable.request_accepted, true),
          or(eq(contactsTable.recv_id, id), eq(contactsTable.sender_id, id)),
        ),
      )
      .orderBy(messageTable.sent_at)
      .all();
    userContacts = ct;
  } catch (error) {
    // @ts-ignore
    if (error.code === "SQLITE_NOTFOUND") {
      logger.error("email not found in locals");
      res.status(404).send({ error: true, message: "user not found" });
      return;
    }
  }
  console.log(userContacts);

  res.status(200).send(userContacts);
}
