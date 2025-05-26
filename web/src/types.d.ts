import { Context } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
export interface UserInfo {
  email: string;
  username: string;
  id: number;
}

export enum CALL_STATE {
  IDLE,
  INITIATED,
  ACTIVE,
}

export type CreateVideoData = {
  sender_username: string;
  recv_username: string;
  sdp: RTCSessionDescriptionInit;
};

export interface UserStoreInfo extends UserInfo {
  contacts: UserInfo[];
  invites: UserInfo[];
  requests: UserInfo[];
  numberOfContacts: number;
  numberOfRequests: number;
  numberOfInvites: number;
  displayFooter: boolean;
  onCall: boolean;
  rtcPeerConnection?: RTCPeerConnection;
}

export interface Chat {
  id: number;
  email: string;
  username: string;
  lastMessage: string;
}

type Time = number;

export enum MessageType {
  text,
  file,
  link,
  // We can send and set event timers from the app
  timer,
  // User contact, for contact sharing
  user,
}

export interface ResponseVideoData {
  sender_username: string;
  recv_username?: string;
  accepted: boolean;
  sdp?: RTCSessionDescriptionInit;
}

export interface MessageDataIn {
  sender_id: number;
  recv_username: string;
  content: string;
}

export interface MessageDataOut extends MessageDataIn {
  // TODO: add message type stuff later
  //  message_type: MessageType,
  sent_at: string;
}

export interface ContactMessages {
  user: UserInfo;
  messages: Message[] | null;
}

export interface Message {
  id: number | string;
  content: string;
  sent_at: number | string;
  sender_id: number | string;
  recv_id: number | string;
}

export interface CurrentUserStore {
  currentUser: UserStoreInfo;
  setCurrentUser: SetStoreFunction<UserStoreInfo>;
  refetchContacts: RefetchContacts;
  refetchInvites: RefetchInvites;
  refetchRequests: RefetchRequests;
  mutateContacts: MutateContacts;
  mutateInvites: MutateInvites;
  mutateRequests: MutateRequests;
}

export type MutateContacts = Setter<UserInfo[] | undefined>;
export type MutateInvites = Setter<UserInfo[] | undefined>;
export type MutateRequests = Setter<UserInfo[] | undefined>;

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

export interface InviteVideoData {
  sender_username: string;
  sdp: string;
}

// Cleans up the type with `T`
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
