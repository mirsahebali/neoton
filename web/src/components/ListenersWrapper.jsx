import { createEffect } from "solid-js";
import { InvitationToast } from "./CustomToasts";
import { useGetUser } from "../contexts";
import { socket } from "../socket";
import toast from "solid-toast";

/**
 * @param {import("solid-js").ParentProps} props -
 * @returns {import("solid-js").JSXElement} -
 */
export default function ListenerWrapper(props) {
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
    socket.on(`invitation for ${currentUser.username}`, (sender) => {
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
