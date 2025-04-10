import { createAsync, useNavigate } from "@solidjs/router";
import { sleep, to } from "./utils";
import { createEffect } from "solid-js";
import toast from "solid-toast";
import { Chat, InviteInfo, Message, RequestsInfo, UserInfo } from "./types";

export const checkSessionRequest = (
  failedRoute: string,
  passedRoute: string | null,
) => {
  const navigate = useNavigate();
  const session = createAsync(async () => {
    const res = await fetch(to("/api/auth/check"), {
      method: "post",
    });
    const data = await res.json();
    return data;
  });

  createEffect(() => {
    if (session().error) {
      navigate(failedRoute);
      return;
    }
    if (!passedRoute) return;
    navigate(passedRoute);
    return;
  });
};

export const getUser = async (): Promise<UserInfo | undefined> => {
  const res = await fetch(to(`/api/db/user`), {
    method: "get",
  });
  if (!res.ok) {
    toast.error("User not found", { duration: 3000 });
    toast.loading("Redirecting to log after 3 seconds....", { duration: 3000 });
    await sleep(3000);
    console.error(
      "Error getting user: \nStatus: %s\nText: %s",
      res.status,
      res.statusText,
    );

    if (res.status === 404 || res.status === 401)
      window.location.href = "/auth/login";
    return;
  }

  let data: UserInfo | undefined;
  try {
    data = await res.json();
  } catch (e) {
    alert("error parsing user to json");
    console.log(await res.text());
    console.error(e);
    return;
  }

  return data;
};

export const getContacts = async (): Promise<UserInfo[] | undefined> => {
  const res = await fetch(to(`/api/db/user/contacts`), {
    method: "get",
  });
  if (!res.ok) {
    console.error("ERROR: status -> ", res.statusText);
    console.error("ERROR: status text-> ", res.status);
    throw new Error("Error getting user details");
  }

  let data;
  try {
    data = await res.json();
  } catch (error) {
    console.error(error);
    // @ts-ignore
    toast.error(error.toString());
    return;
  }
  return data;
};

export const getInvites = async (): Promise<InviteInfo[] | undefined> => {
  const res = await fetch(to(`/api/db/user/invites`), {
    method: "get",
  });
  if (!res.ok) {
    console.error("ERROR: status -> ", res.statusText);
    console.error("ERROR: status text-> ", res.status);
    throw new Error("Error getting user details");
  }

  let data;
  try {
    data = await res.json();
  } catch (error) {
    console.error(error);
    // @ts-ignore
    toast.error(error.toString());
    return;
  }
  return data;
};

export const getRequests = async (): Promise<RequestsInfo[] | undefined> => {
  const res = await fetch(to(`/api/db/user/requests`), {
    method: "get",
  });
  if (!res.ok) {
    console.error("ERROR: status -> ", res.statusText);
    console.error("ERROR: status text-> ", res.status);
    throw new Error("Error getting user details");
  }

  let data;
  try {
    data = await res.json();
  } catch (error) {
    console.error(error);
    // @ts-ignore
    toast.error(error.toString());
    return;
  }
  return data;
};

export const getMessagesOfContact = async (
  username: string,
): Promise<Message[] | undefined> => {
  const res = await fetch(to("/api/db/user/messages/" + username), {
    method: "get",
  });

  if (!res.ok) {
    console.error("ERROR: status -> ", res.statusText);
    console.error("ERROR: status text-> ", res.status);
    throw new Error("Error getting contact messages");
  }

  let contactMessages;
  try {
    contactMessages = await res.json();
  } catch (error) {
    console.error(error);
    // @ts-ignore
    toast.error(error.toString());
    return;
  }
  return contactMessages;
};

export const getChats = async (): Promise<Chat[] | undefined> => {
  const res = await fetch(to("/api/db/user/chats"), {
    method: "get",
  });

  if (!res.ok) {
    console.error("ERROR: status -> ", res.statusText);
    console.error("ERROR: status text-> ", res.status);
    throw new Error("Error getting contact messages");
  }

  let chatMessages;
  try {
    chatMessages = await res.json();
  } catch (error) {
    console.error(error);
    // @ts-ignore
    toast.error(error.toString());
    return;
  }
  return chatMessages;
};
