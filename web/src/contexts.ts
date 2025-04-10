import { createContext, useContext } from "solid-js";
import { CurrentUserStore } from "./types";

export const UserContext = createContext<CurrentUserStore>();

export const useGetUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("Can't find user context");
  return context;
};
