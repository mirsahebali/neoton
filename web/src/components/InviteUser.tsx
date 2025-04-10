import { BiRegularUserPin } from "solid-icons/bi";
import { socket } from "../socket";
import { createEffect, createSignal } from "solid-js";
import { useGetUser } from "../contexts";
import _ from "lodash";
import toast from "solid-toast";
import { AiOutlineUserAdd } from "solid-icons/ai";

export default function InviteUser() {
  const [username, setUsername] = createSignal("");

  const { currentUser, setCurrentUser, refetchRequests } = useGetUser();

  createEffect(() => {
    console.log("Current user", currentUser);
  });

  async function inviteUserEmit(e: SubmitEvent) {
    e.preventDefault();
    if (currentUser.username === username()) {
      toast.error("cannot invite self");
      return;
    }
    socket.emit("invite user", [currentUser.username, username()]);
    let newRequests = await refetchRequests();
    if (!newRequests) return;
    setCurrentUser("requests", newRequests);
  }
  return (
    <div>
      <label
        for="invite_user_modal"
        class="btn text-xl btn-accent w-fit flex mt-5 items-center justify-center gap-3"
      >
        Invite Contact
        <AiOutlineUserAdd />
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
                onchange={(e) => setUsername(e.target.value)}
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
