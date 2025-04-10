import { createEffect, createResource, For, Suspense } from "solid-js";
import InviteUser from "../components/InviteUser";
import { getChats  } from "../requests";
import _ from "lodash";
import { useGetUser } from "../contexts";

export default function Chats() {
  const [contacts] = createResource(getChats);
  const { currentUser } = useGetUser();

  createEffect(() => {
    console.log(contacts());
  });
  return (
    <Suspense fallback={<div>loading.....</div>}>
      <ul class="list bg-base-100 rounded-box shadow-md">
        <For
          each={_.uniqBy(_.reverse(contacts() || []), "username").filter(
            (contact) => contact.username !== currentUser.username,
          )}
          fallback={<div> No Conversations Found </div>}
        >
          {(contact) => (
            <a
              href={"/app/chats/" + contact.username}
              class="list-row flex justify-between items-center bg-base-300"
            >
              <div>
                <div class="text-lg font-semibold">{contact.username}</div>
              </div>
            </a>
          )}
        </For>
      </ul>

      <div class="flex justify-center items-center">
        <InviteUser />
      </div>
    </Suspense>
  );
}
