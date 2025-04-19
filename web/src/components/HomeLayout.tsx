import { Toaster } from "solid-toast";
import Header from "./Header";
import { ParentProps } from "solid-js";

export default function HomeLayout(props: ParentProps) {
  return (
    <main>
      <Header />
      <div> {props.children}</div>
      <footer class="fixed bottom-0 w-full mt-5 bg-neutral text-neutral-content p-10">
        <div class="flex items-center gap-3 justify-center">
          <span class="text-lg"> Created by</span>{" "}
          <b class="text-xl">The Neoton Team</b>
        </div>
      </footer>

      <Toaster />
    </main>
  );
}
