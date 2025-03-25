import { readFileSync } from "fs";

const privateKey = readFileSync("private_key.pem");
const publicKey = readFileSync("public_key.pem");
export const JWT_PRIVATE_KEY = privateKey;
export const JWT_PUBLIC_KEY = publicKey;
export const SALT_ROUNDS = 7;
export const dev_env = process.env.DEV_ENV || "dev";
export const IS_DEV_ENV = dev_env === "dev";
