import ThemeChanger from "./ThemeChanger";

/**
 * @param {import("solid-js").ParentProps} props Parent Props
 * @returns {import("solid-js").JSXElement} Layout for index and auth
 */
export default function HomeLayout(props) {
  return (
    <main>
      <header class="flex items-center justify-center bg-neutral text-neutral-100 py-4 font-bold">
        {/* <img src="/logo.png" alt="logo" /> */}
        <h1 class="text-2xl font-bold"> Neolink</h1>
        <ThemeChanger />
      </header>
      <div> {props.children}</div>
      <footer class="fixed bottom-0 w-full mt-5 bg-neutral text-neutral-content p-10">
        <div class="flex items-center gap-3 justify-center">
          <span class="text-lg"> Created by</span>{" "}
          <b class="text-xl">The Neolink Team</b>
        </div>
      </footer>
    </main>
  );
}
