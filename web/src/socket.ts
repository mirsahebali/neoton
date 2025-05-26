import { io } from "socket.io-client";
import parser from "socket.io-msgpack-parser";
export const rootSocket = io(
  import.meta.env.PROD ? undefined : "http://localhost:8080",
  {
    parser: parser,
  },
);

export const invitationSocket = io(
  (import.meta.env.PROD ? "" : "http://localhost:8080") + "/invitation",
  {
    parser: parser,
  },
);

export const messagingSocket = io(
  (import.meta.env.PROD ? "" : "http://localhost:8080") + "/message",
  {
    parser: parser,
  },
);

export const callSocket = io(
  (import.meta.env.PROD ? "" : "http://localhost:8080") + "/call",
  {
    parser: parser,
  },
);
