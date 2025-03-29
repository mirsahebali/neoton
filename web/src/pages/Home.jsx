import { A } from "@solidjs/router";

export default function About() {
  return (
    <div id="page-main" class="flex flex-col mx-10 justify-start  ">
      <p class="text-4xl mt-10 font-bold "> Neo(new) Communication</p>
      <p class="mt-2 font-semibold">Connect with your closed ones privately</p>
      <div class="mt-10 join">
        <A
          href="/auth/register"
          class="btn join-item w-fit btn-info btn-lg btn-outline"
        >
          Join Neolink
        </A>
        <A href="/auth/login" class="btn join-item w-fit btn-info btn-lg ">
          Sign In
        </A>
      </div>
      <div class="mt-5">
        <div class="mockup-phone  w-[80vw] h-[80vh]">
          <div class="mockup-phone-camera"></div>
          <div class="mockup-phone-display text-white grid place-content-center">
            {/* TODO: add preview screenshot */}
          </div>
        </div>
      </div>
    </div>
  );
}
