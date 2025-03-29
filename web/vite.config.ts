import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import taiwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [solid(), taiwindcss()],
});
