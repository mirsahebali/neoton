import { createSignal } from "solid-js";
import { to } from "../utils/route";
import { action } from "@solidjs/router";

/**
 * @param {FormData} formData - form data for user login
 */
async function loginUser(formData) {
  fetch(to("/user/login"), {
    method: "post",
    body: JSON.stringify({ email: formData.get("email") }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (data) => console.table(data))
    .catch((err) =>
      console.error("ERROR: sending the data body to the server", err),
    )
    .finally(() => console.log("request completed"));
}

const handleLogin = action(loginUser);

function LogInPage() {
  const [enablePassword, setEnablePassword] = createSignal(false);

  return (
    <form action={handleLogin} method="post" class="flex flex-col gap-4 w-66">
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
          name="password"
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
