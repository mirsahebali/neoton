import { action, useNavigate, useSubmission } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import toast from "solid-toast";
import { to } from "../utils";

const handleFormSumbit = async (
  is2FAEnabled: boolean,
  formData: FormData,
): Promise<{ status: number; data: any }> => {
  formData.set("enable_2fa", String(is2FAEnabled));

  console.log(formData);

  const res = await fetch(to("/api/auth/register"), {
    method: "post",
    body: formData,
  });

  return { status: res.status, data: await res.json() };
};
const registerAction = action(handleFormSumbit, "registerUser");

export default function Register() {
  const [enable2FA, toggle2FA] = createSignal(false);
  const [passwordVisibility, togglePasswordVisibility] = createSignal(false);
  const register = useSubmission(registerAction);
  const navigate = useNavigate();

  createEffect(() => {
    if (!register.result) return;
    if (register.result.status !== 200) {
      if (register.result) toast.error(register.result.data.message);
      return;
    }
    if (!register.result.data.error) {
      if (!enable2FA()) {
        localStorage.setItem(
          "email",
          // @ts-ignore
          register.input[1].get("email").toString(),
        );
        navigate("/app/chats");
        return;
      }
      navigate("/auth/verify", {
        state: { email: register.input[1].get("email") },
      });
    }
  });

  return (
    <div>
      <form
        action={registerAction.with(enable2FA())}
        method="post"
        class="mt-5 flex items-center justify-center flex-col gap-3"
      >
        <fieldset class="fieldset p-4 bg-base-100 border border-base-300 rounded-box w-fit">
          <legend class="fieldset-legend">Account Options</legend>

          <label class="fieldset-label w-max">
            <input
              type="checkbox"
              name="enable_2fa"
              checked={enable2FA()}
              onchange={(e) => {
                toggle2FA(!enable2FA());
                console.log(e.target.value);
              }}
              class="checkbox"
            />
            Enable 2FA (recommended) <span>Why? </span>
            <div class="tooltip tooltip-left">
              <div class="tooltip-content">
                <div class=" font-black w-40">
                  You will get an OTP in your email every time you log in.{" "}
                  <br /> This is will increase security level of your account.
                </div>
              </div>
              <button class="text-info  animate-pulse w-fit">
                <InfoIcon />
              </button>
            </div>
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
          <label class="input">
            <UserIcon />
            <input
              name="fullname"
              type="input"
              required
              placeholder="Full Name"
            />
          </label>
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

        <div class="">
          <label class="input validator ">
            <KeyIcon />
            <input
              type={passwordVisibility() ? "text" : "password"}
              name="password"
              required={enable2FA()}
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

function InfoIcon() {
  return (
    <svg
      tabIndex={0}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="h-4 w-4 stroke-current"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
  );
}
