/** @type {(route: string) => string} */
export const to = (route) => {
  if (import.meta.env.MODE === "android") {
    if (import.meta.env.API_URL) {
      throw new Error("API_URL not set");
    }
    return import.meta.env.API_URL;
  }
  return (import.meta.env.PROD ? "" : "http://localhost:8080") + route;
};

/**
 * @param {number} duration -  duration in milliseconds
 */
export async function sleep(duration) {
  await new Promise((res) => setTimeout(res, duration));
}
