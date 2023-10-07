import pgLib from "pg-promise";

const pgp = pgLib({});

// TODO get connection string from env
const db = pgp("");

export { pgp, db };
