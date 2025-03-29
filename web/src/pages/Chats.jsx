import { io } from "socket.io-client";
import { BiRegularUserPin } from "solid-icons/bi";
import { createSignal } from "solid-js";
import { to } from "../utils";

/**
 * @param {string} emailOrUsername -
 * @param {FormData} formData
 */
async function inviteUser(emailOrUsername, formData) {
  formData.append("email_username", emailOrUsername);
  const res = await fetch(to("/api/user/invite"), {
    body: formData,
    method: "post",
  });
}

export default function Chats() {
  const socket = io();
  const [user, setUser] = createSignal("");

  function inviteUserEmit(e) {
    e.preventDefault();
    socket.emit("invite user", [localStorage.email, user()]);
  }
  return (
    <div>
      <label for="invite_user_modal" class="btn btn-accent">
        Invite Contact
      </label>

      <input type="checkbox" id="invite_user_modal" class="modal-toggle" />
      <div class="modal" role="dialog">
        <div class="modal-box">
          <h3 class="text-lg font-bold">Add Username or Email of contact</h3>
          <form onsubmit={inviteUserEmit}>
            <label class="input validator">
              <BiRegularUserPin />
              <input
                type="input"
                required
                placeholder="Username/Email"
                onchange={(e) => setUser(e.target.value)}
                minlength="3"
                maxlength="30"
              />
            </label>
            <button class="btn btn-info">Invite</button>
          </form>

          <div class="modal-action">
            <label for="invite_user_modal" class="btn">
              Close!
            </label>
          </div>
        </div>
        <label class="modal-backdrop" for="invite_user_modal">
          Close
        </label>
      </div>
    </div>
  );
}
