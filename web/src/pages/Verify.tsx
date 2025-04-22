import {
  action,
  useLocation,
  useNavigate,
  useSubmission,
} from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import toast from "solid-toast";
import { sleep, to } from "../utils";
import { FaSolidKey } from "solid-icons/fa";

const handleVerifyOTP = async (email: string, formData: FormData) => {
  formData.append("email", email);
  const res = await fetch(to("/api/auth/verify"), {
    method: "post",
    body: formData,
    credentials: import.meta.env.PROD ? "same-origin" : "include",
  });
  const data = await res.json();
  return data;
};

const verifyOTPAction = action(handleVerifyOTP, "handleUserVerify");

export default function VerifyUser() {
  const location = useLocation<{ email: string }>();
  const navigate = useNavigate();
  const verifyUser = useSubmission(verifyOTPAction);

  let [email, setEmail] = createSignal("");

  createEffect(() => {
    if (!location.state || !location.state.email) {
      toast.error("Unauthenticated user", { duration: 3000 });
      navigate("/auth/login");
      return;
    }

    console.log(email());
    setEmail(location.state.email);
  });

  createEffect(async () => {
    if (verifyUser.error) {
      toast.error(verifyUser.error);
      return;
    }

    if (verifyUser.result.error === true) {
      toast.error(verifyUser.result.message);
      return;
    }

    toast.loading("Redirecting withinin 3 seconds...", { duration: 3000 });
    toast.success("User verified successfully");
    await sleep(3000);
    let email = /** @type {string} */ location.state?.email;
    localStorage.setItem("email", email!);
    navigate("/app/chats");
    return;
  });

  return (
    <div>
      <form
        action={verifyOTPAction.with(email())}
        method="post"
        class="mt-5 flex items-center justify-center flex-col gap-3"
      >
        <label class="input validator">
          <FaSolidKey />
          <input
            type="number"
            name="token"
            placeholder="567890"
            minlength="6"
            pattern="^\d{6}$"
            title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
          />
        </label>
        <button class="btn btn-info" type="submit">
          {verifyUser.pending ? "Verifying...." : "Verify"}
        </button>
      </form>
    </div>
  );
}
