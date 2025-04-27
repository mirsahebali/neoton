import * as v from "valibot";
import { UserInfo } from "./types";

const IDSchema = v.pipe(v.number(), v.minValue(1));

export interface MessageType {
  text: string;
  file: string;
  link: string;
  // We can send and set event timers from the app
  timer: string;
  // User contact, for contact sharing
  user: UserInfo;
}

export const MessageSchema = v.object({
  content: v.pipe(v.string(), v.minLength(1)),
  sent_by: IDSchema,
  recv_by: IDSchema,
  sender_username: v.string(),
});

export const EmailSchema = v.pipe(v.string(), v.email(), v.minLength(4));

export const UserInfoSchema = v.object({
  username: v.pipe(v.string(), v.minLength(3)),
  email: EmailSchema,
  id: IDSchema,
});
