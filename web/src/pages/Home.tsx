import { A } from "@solidjs/router";
import { isMobile } from "../utils";

export default function About() {
  return (
    <div id="page-main" class="flex flex-col mx-10 justify-start items-center ">
      <p class="text-4xl mt-10 font-bold "> Neo(new) Communication</p>
      <p class="mt-2 font-semibold">Connect with your closed ones privately</p>
      <div class="mt-10 join lg:text-center">
        <A
          href="/auth/register"
          class="btn join-item w-fit btn-success btn-lg btn-outline"
        >
          Join Neolink
        </A>
        <A href="/auth/login" class="btn join-item w-fit btn-success btn-lg ">
          Sign In
        </A>
      </div>

      <div class="mt-10 text-center">
        <div> Already Logged in?</div>
        <A href="/app/contacts" class="btn btn-accent btn-dash btn-lg">
          Go to contacts
        </A>
      </div>
      <div class="mt-3">
        <div class="border p-3 scale-75  bg-black rounded-2xl  rotate-12">
          <div class=" text-white grid place-content-center ">
            <img
              src={
                isMobile()
                  ? "/mobile-screenshot.png"
                  : "/desktop-screenshot.jpeg"
              }
              alt={
                isMobile()
                  ? "/mobile-screenshot.png"
                  : "/desktop-screenshot.jpeg"
              }
              class="w-fit p-1 rounded-2xl bg-black h-fit"
            />
            {/* TODO: add preview screenshot */}
          </div>
        </div>
      </div>
    </div>
  );
}
