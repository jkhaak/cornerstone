import { notUndefined } from "../filter-tools.js";
import { expectTypeOf } from "expect-type";

describe("filter tools", () => {
  it("should have a function to filter undefined values", () => {
    const values = [1, undefined, 2, 3, undefined];
    const result = values.filter(notUndefined);
    expect(result).toStrictEqual([1, 2, 3]);
    expectTypeOf(result).toEqualTypeOf<number[]>();
    expectTypeOf(result).not.toEqualTypeOf<undefined[]>();
    expectTypeOf(result).not.toEqualTypeOf<Array<number | undefined>>();
  });
});
