import { AiOutlineCaretDown } from "solid-icons/ai";
export default function ThemeChanger() {
  return (
    <div class="dropdown dropdown-end ">
      <div tabindex="0" role="button" class="btn btn-circle m-1">
        <AiOutlineCaretDown />
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu text-base-100 bg-info rounded-box z-1 w-52 p-2 shadow-sm"
      >
        <li data-set-theme="light" data-act-class="btn-active">
          <button>Light </button>
        </li>
        <li data-set-theme="dark" data-act-class="btn-active">
          <button>Dark </button>
        </li>
        <li data-set-theme="night" data-act-class="btn-active">
          <button>Night </button>
        </li>
        <li data-set-theme="winter" data-act-class="btn-active">
          <button>Winter </button>
        </li>
      </ul>
    </div>
  );
}
