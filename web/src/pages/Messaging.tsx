import { useParams } from "@solidjs/router";
import { BsSend } from "solid-icons/bs";
import {
  createEffect,
  createResource,
  createSignal,
  For,
  on,
  onCleanup,
} from "solid-js";
import { messagingSocket } from "../socket";
import { useGetUser } from "../contexts";
import { getMessagesOfContact } from "../requests";
import "emoji-picker-element";

import toast from "solid-toast";
import _ from "lodash";
import { MessageDataOut } from "../types";

export default function Messaging() {
  const params = useParams();
  const [messagesData, { refetch: refetchMessages, mutate }] = createResource(
    params.username,
    getMessagesOfContact,
  );
  const { currentUser } = useGetUser();
  const [message, setMessage] = createSignal("");

  createEffect(() => {
    if (messagesData.error) {
      toast.error(messagesData.error);
    }
    if (messagesData()) {
      console.log(messagesData());
    }
  });

  // socket.io event listener to get messages
  createEffect(() => {
    const recieveEventName = `accept:${currentUser.username}`;
    console.log("Event name", recieveEventName);
    messagingSocket.on(recieveEventName, async (messageOut: MessageDataOut) => {
      mutate((messages) => [...messages!, messageOut]);
    });
  });

  const [container, setContainer] = createSignal<HTMLElement | undefined>();

  async function sendMessage(e: Event) {
    e.preventDefault();
    if (!message()) return;
    let currentMessage = {
      content: message(),
      sender_id: currentUser.id,
      recv_username: params.username,
    };

    messagingSocket.emit("message:send", currentMessage);

    let dummyMessageOut = {
      ...currentMessage,
      sent_at: new Date().toUTCString(),
    } as MessageDataOut;

    mutate((messages) => [...messages!, dummyMessageOut]);
    setMessage("");
  }

  createEffect(
    on(
      () => messagesData(),
      (_data) => {
        const el = container();
        if (el) {
          el.scrollTop = el.scrollHeight + 20;
        }
      },
    ),
  );

  const timer = setInterval(async () => {
    if (document.visibilityState === "visible") await refetchMessages();
  }, 5000);

  onCleanup(() => {
    clearInterval(timer);
  });

  return (
    <div class="flex items-center  flex-col h-max ">
      <h1 class="fixed bg-base-200 py-2 w-full text-center z-20">
        @{params.username}
      </h1>
      <div class="w-full">
        <div
          ref={setContainer}
          class="overflow-y-scroll h-[80vh] my-10 py-5 lg:mx-32 lg:bg-neutral"
        >
          <For
            each={messagesData() || []}
            fallback={<div> Start a conversation with {params.username}</div>}
          >
            {(msg) => (
              <div
                class={`chat ${msg.sender_id === currentUser.id ? "chat-end" : "chat-start"}`}
              >
                <div
                  class={`chat-bubble ${msg.sender_id === currentUser.id ? "chat-bubble-info" : "chat-bubble-accent"}`}
                >
                  {msg.content}
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class="fixed bottom-0 left-0 w-full">
        <div class="flex justify-center items-center gap-2 mb-2 px-2">
          <div class="dropdown dropdown-top">
            <div tabindex="0" role="button" class="btn ">
              😄
            </div>
            <div
              tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
            >
              {/* @ts-ignore */}
              <emoji-picker
                ref={(e: HTMLElement) =>
                  e.addEventListener("emoji-click", (e) =>
                    // @ts-ignore
                    setMessage((message) => message + e.detail.unicode),
                  )
                }
              >
                {/* @ts-ignore */}
              </emoji-picker>
            </div>
          </div>
          <input
            type="text"
            name="message"
            placeholder="Message"
            value={message()}
            onchange={(e) => {
              setMessage(e.target.value);
            }}
            onkeyup={async (event) => {
              if (event.key === "Enter" || event.code === "Enter") {
                await sendMessage(event);
              }
            }}
            class="input input-info text-lg"
          />
          <button
            class="btn btn-success"
            onclick={sendMessage}
            onkeypress={async (event) => {
              if (event.key === "Enter") {
                await sendMessage(event);
              }
            }}
          >
            <BsSend />
          </button>
        </div>
      </div>
    </div>
  );
}
