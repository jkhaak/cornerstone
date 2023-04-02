export type ValueOf<Obj> = Obj[keyof Obj];

export type Either<T> = { type: "ok"; value: T } | { type: "error"; message: string };

export type GetFormats<Tuples extends [any, any]> = ValueOf<{
  [Tuple in Tuples as Tuple[0]]: Tuple[1];
}>;

export type GetVersion<Tuples extends [any, any]> = ValueOf<{
  [Tuple in Tuples as Tuple[0]]: Tuple[0];
}>;

export function exhausted(input: never): never {
  throw new Error("Exhausted");
}
