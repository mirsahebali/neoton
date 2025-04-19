import ThemeChanger from "./ThemeChanger";

export default function Header() {
  return (
    <header class="flex items-center justify-center bg-neutral text-neutral-100 py-2 font-bold">
      {/* <img src="/logo.png" alt="logo" /> */}
      <a class="text-2xl font-bold" href="/">
        {" "}
        Neoton
      </a>
      <ThemeChanger />
    </header>
  );
}
