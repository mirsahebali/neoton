import { action, useNavigate, useSubmission } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import toast from "solid-toast";

const handleFormSumbit = async (formData: FormData) => {
  const res = await fetch("/api/auth/login", {
    method: "post",
    body: formData,
  });

  for (const pair of res.headers.entries()) {
    console.log("%s: %s", pair[0], pair[1]);
  }

  const data: {
    status: number;
    data: { enabled2fa: boolean; error: boolean; message: string };
  } = { status: res.status, data: await res.json() };
  console.log(data.data);
  return data;
};
const loginAction = action(handleFormSumbit, "loginUser");

export default function Login() {
  const login = useSubmission(loginAction);
  const [email, setEmail] = createSignal("");
  const [passwordVisibility, togglePasswordVisibility] = createSignal(false);
  const navigate = useNavigate();

  createEffect(() => {
    if (login.error) {
      toast.error(login.error);
      return;
    }
    if (login.result) {
      if (login.result.status === 404) {
        toast.error("User not found");
        return;
      }
      if (login.result.data.enabled2fa === true) {
        navigate("/auth/verify", { state: { email: email() } });
        return;
      } else {
        navigate("/app/chats", { state: { email: email() } });
        return;
      }
    }
  });

  return (
    <div>
      <form
        action={loginAction}
        method="post"
        class="mt-5 flex items-center justify-center flex-col gap-3"
      >
        <h1 class="text-2xl text-center font-bold "> Log in to NeoLink</h1>
        <div class="">
          <label class="input validator ">
            <EmailIcon />
            <input
              name="email"
              type="email"
              placeholder="mail@site.com"
              onchange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <div class="validator-hint hidden">Enter valid email address</div>
        </div>

        <div class="">
          <label class="input validator ">
            <KeyIcon />
            <input
              type={passwordVisibility() ? "text" : "password"}
              name="password"
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

        <div class="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            name="visbility"
            onchange={() => {
              togglePasswordVisibility(!passwordVisibility());
            }}
            class="checkbox"
          />
          <label for="visibility">Show password</label>
        </div>

        <button
          class="btn btn-info disabled:btn-disabled"
          disabled={login.pending}
        >
          Log in
        </button>
      </form>

      <div class="text-center mt-5">
        <a href="/auth/register" class="link link-accent ">
          Don't have an account? Create one
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
