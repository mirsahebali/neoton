import { useParams } from "@solidjs/router";
import { BsSend } from "solid-icons/bs";
import { createSignal } from "solid-js";

export default function Messaging() {
  const contactUsername = useParams();
  const [message, setMessage] = createSignal("");

  // GET contact and it's few info
  // GET it's messages
  // Display and render those messages

  async function sendMessage() {}

  return (
    <div class="flex justify-end  items-center flex-col h-max ">
      <h1 class="text-center font-bold w-full bg-base-300 py-2">
        @{contactUsername.username}
      </h1>

      <div class="fixed bottom-0 left-0 w-full">
        <div class="flex justify-center items-center gap-2 mb-2">
          <input
            type="text"
            name="message"
            value={message()}
            onchange={(e) => {
              setMessage(e.target.value);
            }}
            class="input input-info text-lg"
          />
          <button
            class="btn btn-success"
            onclick={() => {
              // send the message
            }}
          >
            <BsSend />
          </button>
        </div>
      </div>
    </div>
  );
}
