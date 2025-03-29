import {
  action,
  useLocation,
  useNavigate,
  useSubmission,
} from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import toast from "solid-toast";
import { to } from "../utils";
import { FaSolidKey } from "solid-icons/fa";

/**
 * @param {string} email - email of the user
 * @param {FormData} formData - form data with email and otp
 */
const handleVerifyOTP = async (email, formData) => {
  formData.append("email", email);
  const res = await fetch(to("/api/auth/verify"), {
    method: "post",
    body: formData,
  });
  const data = await res.json();
  return data;
};

const verifyOTPAction = action(handleVerifyOTP, "handleUserVerify");

export default function VerifyUser() {
  /** @type {import("@solidjs/router").Location<{email: string}>}*/
  const location = useLocation();
  const navigate = useNavigate();
  const verifyUser = useSubmission(verifyOTPAction);

  let [email, setEmail] = createSignal("");
  let [loadingToastId, setLoadingToastId] = createSignal("");

  createEffect(() => {
    if (!location.state || !location.state.email) {
      toast.error("Unauthenticated user", { duration: 3000 });
      navigate("/auth/login");
      return;
    }

    setEmail(location.state.email);
  });

  createEffect(() => {
    if (!verifyUser.result) {
      return;
    }
    if (verifyUser.pending) {
      setLoadingToastId(toast.loading("Verifying user"));
      return;
    }
    if (verifyUser.error) {
      toast.error(verifyUser.error);
      return;
    }

    toast.dismiss(loadingToastId());
    toast.success("User verified successfully");
    let email = /** @type {string} */ (location.state?.email);
    localStorage.setItem("email", email);
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
