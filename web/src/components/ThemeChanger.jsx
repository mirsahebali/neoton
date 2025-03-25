export default function ThemeChanger() {
  return (
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-info m-1">
        Theme
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu text-base-100 bg-info rounded-box z-1 w-52 p-2 shadow-sm"
      >
        <li data-set-theme="light" data-act-class="ACTIVECLASS">
          <button>Light </button>
        </li>
        <li data-set-theme="dark" data-act-class="ACTIVECLASS">
          <button>Dark </button>
        </li>
        <li data-set-theme="sunset" data-act-class="ACTIVECLASS">
          <button>Sunset </button>
        </li>
        <li data-set-theme="caramellatte" data-act-class="ACTIVECLASS">
          <button>Caramellatte </button>
        </li>
        <li data-set-theme="night" data-act-class="ACTIVECLASS">
          <button>Night </button>
        </li>
        <li data-set-theme="winter" data-act-class="ACTIVECLASS">
          <button>Winter </button>
        </li>
      </ul>
    </div>
  );
}
