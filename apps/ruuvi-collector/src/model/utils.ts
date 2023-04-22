export type ValueOf<Obj> = Obj[keyof Obj];

export type Either<T> = { type: "ok"; value: T } | { type: "error"; message: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetFormats<Tuples extends [any, any]> = ValueOf<{
  [Tuple in Tuples as Tuple[0]]: Tuple[1];
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetVersion<Tuples extends [any, any]> = ValueOf<{
  [Tuple in Tuples as Tuple[0]]: Tuple[0];
}>;

export function exhausted(n: never): never {
  throw new Error(`Should have been exhausted, but instead got "${n}"`);
}
