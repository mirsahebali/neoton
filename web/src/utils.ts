import { SetStoreFunction } from "solid-js/store";
import { invitationSocket, rootSocket as _rootSocket } from "./socket";
import {
  RefetchContacts,
  RefetchInvites,
  RefetchRequests,
  UserInfo,
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

/// function which awaits the execution for a set duration in millliseconds
export async function sleep(duration: number) {
  await new Promise((res) => setTimeout(res, duration));
}

export interface AcceptInviteData {
  current: { username: string; id: number };
  sender_username: string;
}

export function acceptInvite(senderUsername: string, currentUser: UserInfo) {
  let data: AcceptInviteData = {
    current: { id: currentUser.id, username: currentUser.username },
    sender_username: senderUsername,
  };


  invitationSocket.emit("user:accept", data);
  console.log(
    "Accepting :",
    data.current.username,
    " -> ",
    data.sender_username,
  );
}

export async function refetchSetUserStore(
  setCurrentUser: SetStoreFunction<UserStoreInfo>,
  refetchContacts: RefetchContacts,
  refetchInvites: RefetchInvites,
  refetchRequests: RefetchRequests,
) {
  const [contacts, invites, requests] = await Promise.all([
    refetchContacts(),
    refetchInvites(),
    refetchRequests(),
  ]);
  if (contacts) {
    setCurrentUser("contacts", contacts);
  }
  if (invites) {
    setCurrentUser("invites", invites);
  }
  if (requests) {
    setCurrentUser("requests", requests);
  }
}

export function isMobile() {
  return window.innerWidth < 420;
}

export function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
}

