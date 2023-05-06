import pgPromise from "pg-promise";
import { getEnvOrElseGet, getEnvOrElse } from "./environment";

const initOptions = {};

const cn = {
  host: getEnvOrElse("DB_HOST", "localhost"),
  port: parseInt(getEnvOrElse("DB_PORT", "5432"), 10),
  database: getEnvOrElseGet("DB_DATABASE", () => {
    throw new Error("Environment variable DB_DATABASE is missing");
  }),
  user: getEnvOrElseGet("DB_USER", () => {
    throw new Error("Environment variable DB_USER is missing");
  }),
  password: getEnvOrElseGet("DB_PASSWORD", () => {
    throw new Error("Environment variable DB_PASSWORD is missing");
  }),
  max: 30, // use up to 30 connections
};

const pgp = pgPromise(initOptions);
const db = pgp(cn);

export { pgp, db };
