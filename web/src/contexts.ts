import { createContext, Resource, useContext } from "solid-js";
import { CurrentUserStore, UserInfo } from "./types";

export const UserContext = createContext<CurrentUserStore>();

export const useGetUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("Can't find user context");
  return context;
};

export type ResourceContextValues = {
  requests: Resource<UserInfo[] | undefined>;
  invites: Resource<UserInfo[] | undefined>;
  contacts: Resource<UserInfo[] | undefined>;
};

export const ResourceContext = createContext<ResourceContextValues>();

export const useResourceState = () => {
  const context = useContext(ResourceContext);

  if (!context) throw new Error("Can't find resources context");

  return context;
};
