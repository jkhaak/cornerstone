export function isSettled<T>(
  promiseSettledResult: PromiseSettledResult<T>
): promiseSettledResult is PromiseFulfilledResult<T> {
  return promiseSettledResult.status === "fulfilled";
}

export function isNotSettled(
  promiseSettledResult: PromiseSettledResult<unknown>
): promiseSettledResult is PromiseRejectedResult {
  return promiseSettledResult.status === "rejected";
}

export function takeSettled<T>(promiseFulfilled: PromiseFulfilledResult<T>): T {
  return promiseFulfilled.value;
}

export function takeError(promiseRejectedResult: PromiseRejectedResult): unknown {
  return promiseRejectedResult.reason;
}

export function filterSettled<T>(promiseSettledResult: PromiseSettledResult<T>[]): T[] {
  return promiseSettledResult.filter(isSettled).map(takeSettled);
}

export function filterRejected<T>(promiseSettledResult: PromiseSettledResult<T>[]): unknown[] {
  return promiseSettledResult.filter(isNotSettled).map(takeError);
}
