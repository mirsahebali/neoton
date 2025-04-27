import { io } from "socket.io-client";
export const rootSocket = io(
  import.meta.env.PROD ? undefined : "http://localhost:8080",
);

export const invitationSocket = io(
  (import.meta.env.PROD ? "" : "http://localhost:8080") + "/invitation",
);

export const messagingSocket = io(
  (import.meta.env.PROD ? "" : "http://localhost:8080") + "/message",
);
