import { createEffect, For } from "solid-js";
import { useGetUser } from "../contexts";
import InviteUser from "../components/InviteUser";
import {
  AiOutlineCheck,
  AiOutlineDelete,
  AiOutlineMessage,
} from "solid-icons/ai";
import { ImCross } from "solid-icons/im";
import { socket } from "../socket";
import toast from "solid-toast";
import _ from "lodash";
import { acceptInvite, refetchSetUserStore } from "../utils";
import { InvitationToast } from "../components/CustomToasts";

export default function Contacts() {
  const {
    currentUser,
    setCurrentUser,
    refetchContacts,
    refetchInvites,
    refetchRequests,
  } = useGetUser();

  createEffect(() => {
    socket.on(`accept-success:${currentUser.username}`, (recvUsername) => {
      toast.success(recvUsername + " accepted your invite");
      refetchContacts();
      refetchInvites();
      refetchRequests();
    });
  });

  return (
    <div class="flex flex-col">
      <div class="text-center m-5">
        <h1 class="divider text-xl font-semibold">Invites</h1>
        <ul class="list bg-base-100 rounded-box shadow-md">
          <For
            each={
              currentUser.invites.length === 0
                ? null
                : _.uniq(currentUser.invites)
            }
            fallback={
              <div class="card bg-base-300 rounded-box grid h-20 grow place-items-center">
                No Invites
              </div>
            }
          >
            {(invite) => (
              <li class="list-row flex justify-between items-center">
                <div class="text-lg font-semibold">
                  @{invite.sender_username}
                </div>
                <div class="flex gap-4">
                  <button
                    onClick={async () => {
                      acceptInvite(
                        invite.sender_username,
                        currentUser.username,
                      );
                      await refetchSetUserStore(
                        setCurrentUser,
                        refetchContacts,
                        refetchInvites,
                        refetchRequests,
                      );
                    }}
                    id="accept-invite"
                    class="btn btn-circle btn-success text-xl font-bold"
                  >
                    <AiOutlineCheck />
                  </button>
                  <button
                    id="delete-invite"
                    class="btn btn-circle btn-error text-xl font-bold"
                  >
                    <ImCross />
                  </button>
                </div>
              </li>
            )}
          </For>
        </ul>
      </div>
      <div class="text-center m-5">
        <h1 class="divider text-xl font-semibold">Requests</h1>

        <ul class="list bg-base-100 rounded-box shadow-md mb-5">
          <For
            each={_.uniq(currentUser.requests)}
            fallback={
              <div class="card bg-base-300 rounded-box flex flex-col items-center py-5 gap-5">
                No Invite Requests Pending
              </div>
            }
          >
            {(request) => (
              <li class="list-row flex justify-between items-center">
                <div class="text-lg font-semibold">
                  @{request.recv_username}
                </div>
                <button class="btn btn-circle btn-error text-xl font-bold">
                  <AiOutlineDelete />
                </button>
              </li>
            )}
          </For>
        </ul>
        <InviteUser />
      </div>
      <div class="text-center m-5">
        <h1 class="divider text-xl font-semibold">Contacts</h1>

        <ul class="list bg-base-100 rounded-box shadow-md">
          <For
            each={currentUser.contacts.filter(
              (contact) => contact.username !== currentUser.username,
            )}
            fallback={
              <div class="card bg-base-300 rounded-box grid h-20 grow place-items-center">
                No Contacts Found
              </div>
            }
          >
            {(contact) => (
              <li class="list-row flex justify-between items-center">
                <div class="text-lg font-semibold">{contact.username}</div>
                <div class="flex gap-4">
                  <a
                    href={"/app/chats/" + contact.username}
                    id="message-contact"
                    class="btn btn-circle btn-error text-xl font-bold"
                  >
                    <AiOutlineMessage />
                  </a>
                  <button
                    id="delelte-contact"
                    class="btn btn-circle btn-error text-xl font-bold"
                  >
                    <AiOutlineDelete />
                  </button>
                </div>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
}
