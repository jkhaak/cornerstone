import { filterRejected, filterSettled } from "../promises";

describe("promises", () => {
  const promises = Promise.allSettled([
    Promise.reject("error"),
    Promise.resolve(1),
    Promise.reject("another error"),
    Promise.resolve(2),
  ]);

  describe("filterSettled", () => {
    it("should take the values of fulfilled promises", async () => {
      expect(filterSettled(await promises)).toStrictEqual([1, 2]);
    });
  });

  describe("filterRejected", () => {
    it("should take the errors of rejected promises", async () => {
      expect(filterRejected(await promises)).toStrictEqual(["error", "another error"]);
    });
  });
});
