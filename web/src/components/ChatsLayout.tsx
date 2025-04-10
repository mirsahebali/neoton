import toast, { Toaster } from "solid-toast";
import Header from "./Header";
import { RiUserFacesContactsLine } from "solid-icons/ri";
import { BiRegularChat } from "solid-icons/bi";
import { AiOutlineSetting } from "solid-icons/ai";
import { IoCallOutline } from "solid-icons/io";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  ParentProps,
  Show,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import { socket } from "../socket";
import { createStore } from "solid-js/store";
import { UserContext } from "../contexts";
import { getContacts, getInvites, getRequests, getUser } from "../requests";
import ListenerWrapper from "./ListenersWrapper";
import { UserStoreInfo } from "../types";

export default function ChatsLayout(props: ParentProps) {
  const [currentUser, setCurrentUser] = createStore<UserStoreInfo>({
    username: "",
    email: "",
    id: "",
    invites: [],
    contacts: [],
    requests: [],
    numberOfContacts: 0,
    numberOfInvites: 0,
    numberOfRequests: 0,
    displayFooter: /** @type {boolean}*/ true,
  });

  const [loadingId, setLoadingId] = createSignal("");

  // gets the current user
  const [user] = createResource(getUser);

  const [contacts, { refetch: refetchContacts }] = createResource(getContacts);
  const [invites, { refetch: refetchInvites }] = createResource(getInvites);
  const [requests, { refetch: refetchRequests }] = createResource(getRequests);
  const [contactLoadingToast, setContactLoadingToast] = createSignal("");
  const [invitesLoadingToast, setInvitesLoadingToast] = createSignal("");
  const [requestsLoadingToast, setRequestsLoadingToast] = createSignal("");

  createEffect(() => {
    console.log("Current User id", currentUser.id);
    console.log("Email", currentUser.email);
    console.log("username", currentUser.username);
  });

  createEffect(() => {
    if (contacts.loading)
      setContactLoadingToast(toast.loading("Loading contacts...."));
    else toast.dismiss(contactLoadingToast());

    if (contacts()) {
      // @ts-ignore
      setCurrentUser("contacts", contacts());
    }
  });

  createEffect(() => {
    if (invites.loading)
      setInvitesLoadingToast(toast.loading("Loading invites...."));
    else toast.dismiss(invitesLoadingToast());

    console.log(invites());
    if (invites()) {
      // @ts-ignore
      setCurrentUser("invites", invites());
    }
  });

  createEffect(() => {
    if (requests.loading)
      setRequestsLoadingToast(toast.loading("Loading requests...."));
    else toast.dismiss(requestsLoadingToast());

    if (requests()) {
      // @ts-ignore
      setCurrentUser("requests", requests());
    }
  });

  // listener to set toast and current user in store
  createEffect(() => {
    if (user.loading) {
      setLoadingId(toast.loading("Getting user"));
    } else {
      toast.dismiss(loadingId());
    }
    if (user.error) {
      toast.error(user.error);
      return;
    }

    if (user()) {
      setCurrentUser({ ...user(), numberOfContacts: 0 });
    }
  });

  socket.on(`error for ${user()?.username}`, (data) => {
    if (data.message) {
      console.error(data);
      toast.error("User not found");
    }
  });

  const location = useLocation();

  const pathname = createMemo(() =>
    location.pathname.substring(location.pathname.lastIndexOf("/") + 1),
  );

  const currentPath = createMemo(() => location.pathname);

  createEffect(() => {
    const pathRegex = /^\/app\/(chats|contacts|calls|settings)$/;

    setCurrentUser("displayFooter", pathRegex.test(currentPath()));

    console.log("Pathname", currentPath());
  });

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        refetchContacts,
        refetchInvites,
        refetchRequests,
      }}
    >
      <ListenerWrapper>
        <main>
          <Header />
          <div class="h-full"> {props.children}</div>

          <Show when={currentUser.displayFooter}>
            <footer class="fixed bottom-0 w-full text-neutral-content p-10">
              <ChatDock selected={pathname()} />
            </footer>
          </Show>
        </main>

        <Toaster />
      </ListenerWrapper>
    </UserContext.Provider>
  );
}

function ChatDock(props: { selected: string }) {
  const dockItems = [
    {
      icon: BiRegularChat,
      label: "Chats",
    },
    {
      icon: RiUserFacesContactsLine,
      label: "Contacts",
    },
    { icon: IoCallOutline, label: "Calls" },
    {
      icon: AiOutlineSetting,
      label: "Settings",
    },
  ];
  return (
    <div class="dock text-lg">
      <For each={dockItems}>
        {(item) => {
          return (
            <a
              href={"/app/" + item.label.toLowerCase()}
              class={
                props.selected === item.label.toLowerCase() ? "dock-active" : ""
              }
            >
              <item.icon class="text-2xl" />
              <span class="dock-label text-xl"> {item.label}</span>
            </a>
          );
        }}
      </For>
    </div>
  );
}
