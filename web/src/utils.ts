import { SetStoreFunction } from "solid-js/store";
import { socket } from "./socket";
import {
  RefetchContacts,
  RefetchInvites,
  RefetchRequests,
  UserStoreInfo,
} from "./types";

export const to = (route: string): string => {
  return (import.meta.env.PROD ? "" : "http://localhost:8080") + route;
};

export async function sleep(duration: number) {
  await new Promise((res) => setTimeout(res, duration));
}

export function acceptInvite(senderUsername: string, currentUsername: string) {
  socket.emit(`accept-invite`, [currentUsername, senderUsername]);
}

export async function refetchSetUserStore(
  setCurrentUser: SetStoreFunction<UserStoreInfo>,
  refetchContacts: RefetchContacts,
  refetchInvites: RefetchInvites,
  refetchRequests: RefetchRequests,
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

export function isMobile() {
  return window.innerWidth < 420;
}
