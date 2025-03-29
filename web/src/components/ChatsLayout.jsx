import { Toaster } from "solid-toast";
import Header from "./Header";
import { RiUserFacesContactsLine } from "solid-icons/ri";
import { BiRegularChat } from "solid-icons/bi";
import { AiOutlineSetting } from "solid-icons/ai";
import { IoCallOutline } from "solid-icons/io";
import { createMemo, For } from "solid-js";
import { useLocation } from "@solidjs/router";

/**
 * @param {import("solid-js").ParentProps} props Parent Props
 * @returns {import("solid-js").JSXElement} Layout for index and auth
 */
export default function ChatsLayout(props) {
  const location = useLocation();

  const pathname = createMemo(() =>
    location.pathname.substring(location.pathname.lastIndexOf("/") + 1),
  );
  console.log(pathname);

  return (
    <main>
      <Header />
      <div> {props.children}</div>
      <footer class="fixed bottom-0 w-full mt-5  text-neutral-content p-10">
        <ChatDock selected={pathname()} />
      </footer>

      <Toaster />
    </main>
  );
}

/**
 * @param {{ selected: string  }} props - tab selected prop
 * @returns {import("solid-js").JSXElement}
 */
function ChatDock(props) {
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
    <div class="dock">
      <For each={dockItems}>
        {(item) => {
          return (
            <a
              href={"/app/" + item.label.toLowerCase()}
              class={
                props.selected === item.label.toLowerCase() ? "dock-active" : ""
              }
            >
              <item.icon />
              <span class="dock-label"> {item.label}</span>
            </a>
          );
        }}
      </For>
    </div>
  );
}
