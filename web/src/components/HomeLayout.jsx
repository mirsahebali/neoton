import { Toaster } from "solid-toast";
import Header from "./Header";

/**
 * @param {import("solid-js").ParentProps} props Parent Props
 * @returns {import("solid-js").JSXElement} Layout for index and auth
 */
export default function HomeLayout(props) {
  return (
    <main>
      <Header />
      <div> {props.children}</div>
      <footer class="fixed bottom-0 w-full mt-5 bg-neutral text-neutral-content p-10">
        <div class="flex items-center gap-3 justify-center">
          <span class="text-lg"> Created by</span>{" "}
          <b class="text-xl">The Neolink Team</b>
        </div>
      </footer>

      <Toaster />
    </main>
  );
}
