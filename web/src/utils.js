/** @type {(route: string) => string} */
export const to = (route) =>
  (import.meta.env.PROD ? "" : "http://localhost:8080") + route;
