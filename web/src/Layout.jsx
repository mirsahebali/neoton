import { onMount } from "solid-js";
import { themeChange } from "theme-change";

const Layout = () => {
  onMount(async () => {
    themeChange();
  });

  return (
    <div>
      <button data-toggle-theme="light,dark" class="btn btn-primary">
        Toggle
      </button>
    </div>
  );
};

export default Layout;
