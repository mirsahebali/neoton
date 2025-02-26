import NavLinks from "./NavLinks";
import { AiOutlineLogin } from "solid-icons/ai";
import { AiOutlineUserAdd } from "solid-icons/ai";
/**
 * @param {import("@solidjs/router").RouteSectionProps<unknown>} props -
 * @returns {import("solid-js").JSXElement} -
 */
function AuthLayout(props) {
  return (
    <>
      <header class="flex items-center justify-center mt-20 gap-2 mb-20">
        <img src="logo-dark.png" alt="neolink logo" />
        <h1 class="text-3xl font-extrabold">Neolink</h1>
      </header>
      <main class="flex items-center justify-center">{props.children}</main>
      <footer class="fixed left-0 bottom-0 w-full">
        <NavLinks
          links={[
            { icon: AiOutlineLogin, name: "Log in", route: "/login" },
            { icon: AiOutlineUserAdd, name: "Sign up", route: "/signup" },
          ]}
        />
      </footer>
    </>
  );
}
export default AuthLayout;
