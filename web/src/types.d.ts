import { Context } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
export interface UserInfo {
  email: string;
  username: string;
  id: string;
}

export interface InviteInfo {
  sender_email: string;
  sender_username: string;
  sender_id: string;
}

export interface RequestsInfo {
  recv_email: string;
  recv_username: string;
  recv_id: string;
}

export interface UserStoreInfo extends UserInfo {
  contacts: UserInfo[];
  invites: InviteInfo[];
  requests: RequestsInfo[];
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
  id: string;
  content: string;
  sent_at: number;
  sent_by: string;
  recv_by: string;
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
) => InviteInfo[] | Promise<InviteInfo[] | undefined> | null | undefined;
export type RefetchRequests = (
  info?: unknown,
) => RequestsInfo[] | Promise<RequestsInfo[] | undefined> | null | undefined;

export type SetCurrentUserFunction = SetStoreFunction<UserStoreInfo>;

export interface Contact {
  sender_id: string;
  recv_id: string;

  request_accepted: boolean;
}
