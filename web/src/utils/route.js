// TODO: change this to accept from an environment variable
const API_URL = "http://localhost:8080";
/**
 * @param {string} route -
 * @returns {string} route of the api
 */
export const to = (route) => API_URL + route;
