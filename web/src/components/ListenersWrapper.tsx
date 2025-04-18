import { createEffect, ParentProps } from "solid-js";
import { InvitationToast } from "./CustomToasts";
import { useGetUser } from "../contexts";
import { invitationSocket, socket } from "../socket";
import toast from "solid-toast";

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
    // Listens to incoming invitations
    invitationSocket.on(`invitation:${currentUser.username}`, (sender) => {
      InvitationToast(
        sender,
        currentUser.username,
        setCurrentUser,
        refetchContacts,
        refetchInvites,
        refetchRequests,
      );
    });

    let errorEventName = `error:${currentUser.username}`;

    socket.on(errorEventName, (data) => {
      toast.error(data);
    });
  });
  return <>{props.children}</>;
}
