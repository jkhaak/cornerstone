import { db } from "../database";
import type { Response } from "supertest";

/**
 * Truncates given tables with cascade.
 */
export function truncateTables(tables: string[]) {
  return db.tx(async (tx) => {
    await Promise.allSettled(tables.map((t) => tx.none("truncate table $1:name cascade", t)));
  });
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
