import { action } from "@solidjs/router";
import { to } from "../utils";

/**
 * @param {string} email -
 * @param {FormData} formData -
 */
const otpSubmitHandler = async (email, formData) => {
  const res = await fetch(to("/api/auth/verify"), {
    method: "post",
    body: formData,
  });

  /** @type {{verified: boolean, message: string}} */
  const data = await res.json();

  return data;
};

const otpAction = action(otpSubmitHandler);

/**
 * @param {{email: string}} props - OTP email props
 * @returns {import("solid-js").JSXElement} - OTP Form
 */
export default function OTPForm(props) {
  return <form action={otpAction.with(props.email)}></form>;
}
