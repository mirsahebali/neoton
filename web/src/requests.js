import { createAsync, useNavigate } from "@solidjs/router";
import { sleep, to } from "./utils";
import { createEffect } from "solid-js";
import toast from "solid-toast";

export const checkSessionRequest = () => {
  const navigate = useNavigate();
  const session = createAsync(async () => {
    let formdata = new FormData();
    formdata.append("email", localStorage.email);
    const res = await fetch(to("/api/auth/check"), {
      method: "post",
      body: formdata,
    });
    const data = await res.json();
    return data;
  });
  createEffect(async () => {
    if (!localStorage.getItem("email")) {
      navigate("/auth/login");
      return;
    }
    await sleep(3000);
    if (session().error) {
      navigate("/auth/login");

      toast.error(session().message);
      return;
    }
  });
};
