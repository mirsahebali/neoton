import { createContext, useContext } from "solid-js";

/** @type {import("./types").UserContext} */
export const UserContext = createContext();

export const useGetUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("Can't find user context");
  return context;
};
