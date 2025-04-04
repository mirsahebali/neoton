import { socket } from "./socket";

/** @type {(route: string) => string} */
export const to = (route) => {
  return (import.meta.env.PROD ? "" : "http://localhost:8080") + route;
};

/**
 * @param {number} duration -  duration in milliseconds
 */
export async function sleep(duration) {
  await new Promise((res) => setTimeout(res, duration));
}

/**
 * @param {string} senderUsername
 * @param {string} currentUsername
 */
export function acceptInvite(senderUsername, currentUsername) {
  socket.emit(`accept-invite`, [currentUsername, senderUsername]);
}

/**
 * @param {import("solid-js/store").SetStoreFunction<import("./types").UserStoreInfo>} setCurrentUser -
 * @param {import("./types").RefetchContacts} refetchContacts -
 * @param {import("./types").RefetchInvites} refetchInvites -
 * @param {import("./types").RefetchRequests} refetchRequests -
 */
export async function refetchSetUserStore(
  setCurrentUser,
  refetchContacts,
  refetchInvites,
  refetchRequests,
) {
  const contacts = await refetchContacts();
  if (contacts) {
    setCurrentUser("contacts", contacts);
  }
  const invites = await refetchInvites();
  if (invites) {
    setCurrentUser("invites", invites);
  }
  const requests = await refetchRequests();
  if (requests) {
    setCurrentUser("requests", requests);
  }
}
