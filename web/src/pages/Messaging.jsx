import { useParams } from "@solidjs/router";
import { BsSend } from "solid-icons/bs";
import { createEffect, createResource, createSignal, For } from "solid-js";
import { socket } from "../socket";
import { useGetUser } from "../contexts";
import { getMessagesOfContact } from "../requests";
import "emoji-picker-element";

import toast from "solid-toast";
import _ from "lodash";

export default function Messaging() {
  const params = useParams();
  const [messagesData, { refetch: refetchMessages }] = createResource(
    params.username,
    getMessagesOfContact,
  );
  const { currentUser } = useGetUser();
  const [message, setMessage] = createSignal("");
  const [messages, setMessages] =
    /** @type {typeof createSignal<import("../types").Message[]>}*/ (
      createSignal
    )([]);

  createEffect(() => {
    if (messagesData.error) {
      toast.error(messagesData.error);
    }
    setMessages(messagesData() || []);
  });

  // socket.io event listener to get messages
  createEffect(() => {
    const recieveEventName = `recieve-message:${currentUser.username}`;
    console.log("Event name", recieveEventName);
    socket.on(
      recieveEventName,
      async ([senderUsername, content, senderId, sentAt]) => {
        console.log("Tiggerred?");
        await refetchMessages();
        let currMessage = {
          content,
          sent_by: senderId,
          recv_by: currentUser.username,
          sent_at: sentAt,
          id: "",
        };
        setMessages((messages) => {
          messages.push(currMessage);
          return messages;
        });
      },
    );
  });

  /**
   * @param {Event} e - input event
   */
  async function sendMessage(e) {
    e.preventDefault();
    if (!message()) return;
    socket.emit("send-message", [
      currentUser.username,
      params.username,
      message(),
    ]);
    await refetchMessages();
    setMessage("");
  }

  const [container, setContainer] = createSignal();
  createEffect(() => {
    messages();
    const el = container();
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
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
          <For each={messages() || []}>
            {(msg) => (
              <div
                class={`chat ${msg.sent_by === currentUser.id ? "chat-end" : "chat-start"}`}
              >
                <div
                  class={`chat-bubble ${msg.sent_by === currentUser.id ? "chat-bubble-info" : "chat-bubble-accent"}`}
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
                ref={(/** @type {HTMLElement}*/ e) =>
                  e.addEventListener("emoji-click", (e) =>
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
            class="input input-info text-lg"
          />
          <button
            class="btn btn-success"
            onclick={async (e) => {
              await sendMessage(e);
            }}
          >
            <BsSend />
          </button>
        </div>
      </div>
    </div>
  );
}
