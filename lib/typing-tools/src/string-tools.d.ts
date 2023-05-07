/**
 * Change string from camel case to snake case.
 */
export type CamelToSnake<Str, Acc extends string = ""> = Str extends `${infer First}${infer Rest}`
  ? First extends Uppercase<First>
    ? CamelToSnake<Rest, `${Acc}_${Lowercase<First>}`>
    : CamelToSnake<Rest, `${Acc}${First}`>
  : Acc;
