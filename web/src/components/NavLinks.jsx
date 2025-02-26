import { A } from "@solidjs/router";
import { For } from "solid-js";

/**
 * @param {{children?: Element, links: import("./types").LinkProp[] }} props -
 
 * @returns {import("solid-js").JSXElement} -
 */
function NavLinks(props) {
  return (
    <div class="flex justify-around bg-[#F0F3FB] py-2 ">
      <For each={props.links}>
        {(link) => (
          <A href={link.route} class="flex flex-col items-center">
            <span>
              <link.icon class="text-xl" />
            </span>
            <span class="text-sm">{link.name}</span>
          </A>
        )}
      </For>
    </div>
  );
}
export default NavLinks;
