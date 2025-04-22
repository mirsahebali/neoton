import { createEffect, ParentProps } from "solid-js";
import { InvitationToast } from "./CustomToasts";
import { useGetUser } from "../contexts";
import { invitationSocket } from "../socket";
import toast from "solid-toast";
import _ from "lodash";
import { SocketSendInviteData, UserInfo } from "../types";
import { dbg } from "../utils";

export default function ListenerWrapper(props: ParentProps) {
  const {
    currentUser,
    refetchContacts,
    refetchInvites,
    refetchRequests,
    setCurrentUser,
  } = useGetUser();

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
      InvitationToast(
        data.sender.username,
        currentUser.username,
        setCurrentUser,
        refetchContacts,
        refetchInvites,
        refetchRequests,
      );
    });

    let errorEventName = `error:${currentUser.username}`;

    invitationSocket.on(errorEventName, (data) => {
      toast.error(data);
    });
  });
  return <>{props.children}</>;
}
