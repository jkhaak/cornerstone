import { db } from "../database";
import type { Response } from "supertest";
import { logger } from "@cornerstone/core";

/**
 * Teardown database connection after test run. Should be called in afterAll stage
 * outside of describe block.
 */
export function teardownTestConnection() {
  if (!db.$pool.ended) {
    db.$pool
      .end()
      .then(() => logger.info({ message: "DB connection closed succesfully" }))
      .catch((error: unknown) =>
        logger.error({ message: "Unexpected error happened while closing database connection.", error })
      );
  }
}

/**
 * Truncates given tables with cascade.
 */
export async function truncateTables(tables: string[]) {
  await db.tx((tx) => Promise.allSettled(tables.map((t) => tx.none("truncate table $1:name cascade", t))));
}

/**
 * Convert superttest headers from any to known record.
 */
export function getHeaders(response: Response): Record<Lowercase<string>, string> {
  const unknownHeaders: unknown = response.headers;

  if (Array.isArray(unknownHeaders)) {
    throw new Error("expected record not array");
  }

  if (
    Object.getOwnPropertySymbols(unknownHeaders).length > 0 &&
    !Object.getOwnPropertyNames(unknownHeaders).every((prop) => typeof prop === "string")
  ) {
    throw new Error("should have properties and property names should be string");
  }

  const headers = unknownHeaders as Record<string, unknown>;

  if (!Object.getOwnPropertyNames(headers).every((prop) => typeof headers[prop] === "string")) {
    throw new Error("properties should be string");
  }

  // return headers as Record<string, string>;
  return Object.fromEntries(
    Object.entries(headers as Record<string, string>).map(([prop, val]) => [prop.toLowerCase(), val])
  );
}
