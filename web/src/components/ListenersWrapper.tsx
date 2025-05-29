import { createEffect, ParentProps } from "solid-js";
import { InvitationToast } from "./CustomToasts";
import { useGetUser } from "../contexts";
import { callSocket, invitationSocket, messagingSocket } from "../socket";
import toast from "solid-toast";
import _ from "lodash";
import {
  MessageDataOut,
  ResponseVideoData,
  SocketSendInviteData,
  UserInfo,
} from "../types";
import { dbg, ICE_SERVERS } from "../utils";

export default function ListenerWrapper(props: ParentProps) {
  const currentUserStoreContext = useGetUser();

  const {
    currentUser,
    setCurrentUser,
    refetchContacts,
    refetchRequests,
    refetchInvites,
  } = currentUserStoreContext;

  // Invitation listener
  createEffect(() => {
    invitationSocket.on("connection", (message) => {
      console.log("Message from server on connection: ", message);
    });
    let eventName = dbg(`invitation:${currentUser.username}`);
    const listener = (eventName: string, ...args: any[]) => {
      console.log("Event: ", eventName, "args: ", args);
    };
    invitationSocket.onAny(listener);
    // Listens to incoming invitations
    invitationSocket.on(eventName, (data: SocketSendInviteData) => {
      let newInvite: UserInfo = {
        id: data.sender.id,
        username: data.sender.username,
        email: "",
      };
      setCurrentUser("invites", (invites) => {
        invites.push(newInvite);
        return invites;
      });
      InvitationToast(data.sender.username, currentUserStoreContext);
    });

    eventName = `accepted:${currentUser.username}`;

    invitationSocket.on(eventName, async (recvUsername) => {
      toast.success(recvUsername + " accepted your invite");
      await refetchContacts();
      await refetchInvites();
      await refetchRequests();
    });
    let errorEventName = `error:${currentUserStoreContext.currentUser.username}`;

    invitationSocket.on(errorEventName, (data) => {
      toast.error(data);
    });

    messagingSocket.on(
      `notify:${currentUser.username}`,
      (_data: MessageDataOut) => {
        //
      },
    );
  });

  return <>{props.children}</>;
}
