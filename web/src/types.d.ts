import { Context } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
export interface UserInfo {
  email: string;
  username: string;
  id: number;
}

export interface UserStoreInfo extends UserInfo {
  contacts: UserInfo[];
  invites: UserInfo[];
  requests: UserInfo[];
  numberOfContacts: number;
  numberOfRequests: number;
  numberOfInvites: number;
  displayFooter: boolean;
}

export interface Chat {
  id: number;
  email: string;
  username: string;
  lastMessage: string;
}

export interface ContactMessages {
  user: UserInfo;
  messages: Message[] | null;
}

export interface Message {
  id: number | string;
  content: string;
  sent_at: number | string;
  sent_by: number | string;
  recv_by: number | string;
}

export interface CurrentUserStore {
  currentUser: UserStoreInfo;
  setCurrentUser: SetStoreFunction<UserStoreInfo>;
  refetchContacts: RefetchContacts;
  refetchInvites: RefetchInvites;
  refetchRequests: RefetchRequests;
}

export type RefetchContacts = (
  info?: unknown,
) => UserInfo[] | Promise<UserInfo[] | undefined> | null | undefined;

export type RefetchInvites = (
  info?: unknown,
) => UserInfo[] | Promise<UserInfo[] | undefined> | null | undefined;
export type RefetchRequests = (
  info?: unknown,
) => UserInfo[] | Promise<UserInfo[] | undefined> | null | undefined;

export type SetCurrentUserFunction = SetStoreFunction<UserStoreInfo>;

export interface Contact {
  sender_id: string;
  recv_id: string;

  request_accepted: boolean;
}

export interface SocketSendInviteData {
  sender: { username: string; id: number };
  recv_username: string;
}
