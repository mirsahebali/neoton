import NavLinks from "./NavLinks";
import { BsChat } from "solid-icons/bs";
import { IoCallOutline } from "solid-icons/io";
import { FiFolder } from "solid-icons/fi";
import { TbSettings2 } from "solid-icons/tb";

/**
 * @param {import("@solidjs/router").RouteSectionProps<unknown>} props -
 * @returns {import("solid-js").JSXElement} -
 */
function AppLayout(props) {
  const links = [
    {
      icon: BsChat,
      name: "Chats",
      route: "/chats",
    },
    {
      icon: IoCallOutline,
      name: "Calls",
      route: "/calls",
    },
    {
      icon: FiFolder,
      name: "Files",
      route: "/files",
    },
    {
      icon: TbSettings2,
      name: "Settings",
      route: "/Settings",
    },
  ];
  return (
    <>
      <header class="flex items-center justify-end gap-2 mr-4">
        <img src="logo-dark.png" alt="neolink logo" />
        <span>Neolink</span>
      </header>
      {props.children}
      <footer class="fixed left-0 bottom-0 w-full">
        <NavLinks links={links} />
      </footer>
    </>
  );
}

export default AppLayout;
