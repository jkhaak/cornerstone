// prettier-ignore
jest.mock("@cornerstone/core")

import { errorHandler } from "../util/error-handler.js";
import { logger } from "@cornerstone/core";

describe("error handler", () => {
  it("should call logger.error when called", () => {
    const mockFn = jest.fn();
    const contextString = "context string";
    const testError = new Error("hello world");
    logger.error = mockFn;

    const errHandler = errorHandler(contextString);

    expect(logger.error).not.toBeCalled();

    errHandler(testError);

    expect(logger.error).toBeCalled();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const { message, context, error } = mockFn.mock.calls[0][0];
    expect(message).toContain(contextString);
    expect(context).toStrictEqual(contextString);
    expect(error).toStrictEqual(testError);
  });
});
