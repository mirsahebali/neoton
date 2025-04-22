import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import taiwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";
export default defineConfig({
  plugins: [solid(), taiwindcss(), mkcert()],
});
