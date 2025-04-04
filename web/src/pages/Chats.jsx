import { Suspense } from "solid-js";
import InviteUser from "../components/InviteUser";

export default function Chats() {
  return (
    <Suspense fallback={<div>loading.....</div>}>
      <InviteUser />
    </Suspense>
  );
}
