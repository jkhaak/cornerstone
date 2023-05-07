import { CamelToSnake } from "./string-tools";

/**
 * Remove undefined and null from object values.
 */
export type NonNullableObj<Obj> = {
  [Key in keyof Obj]: NonNullable<Obj[Key]>;
};

/**
 * Change object keys from camel case to snake case.
 */
export type CamelToSnakeKeys<Obj> = {
  [Key in keyof Obj as CamelToSnake<Key>]: Obj[Key];
};
