import { action, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import { to } from "../utils";

/**
 * @param {boolean} isEnabledPassword - login form data
 * @param {FormData} formData - login form data
 * @returns {Promise<{status: number, data: any}>} - json response
 */
const handleFormSumbit = async (isEnabledPassword, formData) => {
  formData.append("password_enabled", String(isEnabledPassword));
  const res = await fetch(to("/api/auth/register"), {
    method: "post",
    body: formData,
  });

  return { status: res.status, data: await res.json() };
};
const registerAction = action(handleFormSumbit, "registerUser");

export default function Register() {
  const [enabledPassword, toggleEnablePassword] = createSignal(false);
  const register = useSubmission(registerAction);

  createEffect(() => {
    if (!register.pending && register.result) {
      toast.success("Created account successfully", { duration: 3000 });
      // Perform certain operations
      // 1. take a jwt token and set it as cookie
      // 2. redirect the user to it's chat's dashboard
    }
  });

  return (
    <div>
      <form
        action={registerAction.with(enabledPassword())}
        method="post"
        class="mt-5 flex items-center justify-center flex-col gap-3"
      >
        <fieldset class="fieldset p-4 bg-base-100 border border-base-300 rounded-box w-64">
          <legend class="fieldset-legend">Login options</legend>

          <label class="fieldset-label w-max">
            <input
              type="checkbox"
              name="password_enabled"
              checked={enabledPassword()}
              value={Number(enabledPassword())}
              onclick={() => toggleEnablePassword(!enabledPassword())}
              class="checkbox"
            />
            Enable Password (not recommended)
          </label>
        </fieldset>
        <div class="">
          <label class="input validator ">
            <EmailIcon />
            <input
              name="email"
              type="email"
              placeholder="mail@site.com"
              required
            />
          </label>
          <div class="validator-hint hidden">Enter valid email address</div>
        </div>

        <div>
          <label class="input validator">
            <UserIcon />
            <input
              name="username"
              type="input"
              required
              placeholder="Username"
              pattern="[A-Za-z][A-Za-z0-9\-]*"
              minlength="3"
              maxlength="30"
              title="Only letters, numbers or dash"
            />
          </label>
          <p class="validator-hint hidden">
            Must be 3 to 30 characters
            <br />
            containing only letters, numbers or dash
          </p>
        </div>
        <Show when={enabledPassword()}>
          <div class="">
            <label class="input validator ">
              <KeyIcon />
              <input
                type="password"
                name="password"
                required={enabledPassword()}
                placeholder="Password"
                minlength="8"
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
              />
            </label>
            <p class="validator-hint hidden">
              Must be more than 8 characters, including
              <br />
              At least one number
              <br />
              At least one lowercase letter
              <br />
              At least one uppercase letter
            </p>
          </div>
        </Show>
        <button class="btn btn-info" disabled={register.pending}>
          {register.pending ? "Creating account..." : " Register"}
        </button>
      </form>

      <div class="text-center mt-5">
        <a href="/auth/login" class="link link-accent ">
          Account already exists? Sign In
        </a>
      </div>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg
      class="h-[1em] opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
      >
        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
      </g>
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      class="h-[1em] opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
      >
        <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
      </g>
    </svg>
  );
}
function UserIcon() {
  return (
    <svg
      class="h-[1em] opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </g>
    </svg>
  );
}
