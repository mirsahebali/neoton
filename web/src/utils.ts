import { SetStoreFunction } from "solid-js/store";
import { invitationSocket, rootSocket } from "./socket";
import {
  RefetchContacts,
  RefetchInvites,
  RefetchRequests,
  UserStoreInfo,
} from "./types";

export const to = (route: string): string => {
  return (import.meta.env.PROD ? "" : "http://localhost:8080") + route;
};

// Debug function which logs the value and returns it to be used in any value for assignment
export const dbg = <T>(val: T): T => {
  console.log(val);
  return val;
};

export async function sleep(duration: number) {
  await new Promise((res) => setTimeout(res, duration));
}

export function acceptInvite(senderUsername: string, currentUsername: string) {
  let data = [currentUsername, senderUsername];
  invitationSocket.emit("user:accept", data);
  console.log("Accepting :", data[0], " -> ", data[1]);
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
