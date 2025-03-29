import pino from "pino";

export const logger = pino({
  redact: {
    paths: ["hashed_password"],
  },
});
