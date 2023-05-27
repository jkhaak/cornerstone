import { format } from "../datetime";

describe("datetime", () => {
  it("should format date as RFC3339 with three fractions", () => {
    let result = format(new Date(0).getTime());
    expect(result).toBe("1970-01-01T00:00:00.000Z");
    result = format(new Date(0));
    expect(result).toBe("1970-01-01T00:00:00.000Z");
    result = format(new Date(2019, 8, 18, 19, 0, 52, 234));
    expect(result).toBe("2019-09-18T16:00:52.234Z");
    expect(format(new Date())).toBe(format(Date.now()));
  });
});
