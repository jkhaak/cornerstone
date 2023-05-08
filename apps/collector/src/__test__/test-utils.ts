import { db } from "../database";

/**
 * Truncates given tables with cascade.
 */
export function truncateTables(tables: string[]) {
  return db.tx(async (tx) => {
    await Promise.allSettled(tables.map((t) => tx.none("truncate table $1:name cascade", t)));
  });
}
