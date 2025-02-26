import { createSignal } from "solid-js";
import { to } from "../utils/route";

function LogInPage() {
  const [enablePassword, setEnablePassword] = createSignal(false);
  return (
    <form action={to("/user/login")} class="flex flex-col gap-4 w-66">
      <input
        name="email"
        type="text"
        class="border px-2 py-1"
        placeholder="Email"
      />

      <span class="flex gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="password-enabled"
          value="password_enabled"
          checked={enablePassword()}
          onchange={(e) => setEnablePassword(e.target.checked)}
        />
        <label for="password-enabled">Enable Password auth</label>
      </span>
      {enablePassword() && (
        <input
          name="email"
          type="text"
          class="border px-2 py-1"
          placeholder="Password (not recommended)"
        />
      )}
      <button class="border" type="submit">
        {" "}
        Login{" "}
      </button>
    </form>
  );
}
export default LogInPage;
