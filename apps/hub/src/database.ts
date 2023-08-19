import pgLib from "pg-promise";

export function getDB(...args: Parameters<pgLib.IMain>) {
  const pgp = pgLib({});
  return {
    db: pgp(...args),
    pgp,
  };
}
