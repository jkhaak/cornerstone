import pgLib from "pg-promise";

const pgp = pgLib({});

// eslint-disable-next-line dot-notation
const cn = process.env["DB_CN"];

if (!cn) {
  throw new Error('Environment variable "DB_CN" has not been set!');
}

const db = pgp(cn);

export { pgp, db };
