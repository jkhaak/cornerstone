/*
const axiosPostMock = jest.fn().mockResolvedValue({ status: 200 });

jest.mock("axios", () => ({
  post: axiosPostMock,
}));

// prettierignore
import { Endpoint } from "../services/endpoint";

describe("endpoint", () => {
  it("should send the event", async () => {
    const url = "test.example.com";
    const endpoint = new Endpoint(url);
    const event = { manufacturerDataBase64: "dadaa" };
    await endpoint.sendEvent(event);

    expect(axiosPostMock.mock.calls).toMatchObject([[`${url}/ruuvi/event`, event, expect.anything()]]);
  });

  it("should validate return status", async () => {
    const url = "test.example.com";
    const endpoint = new Endpoint(url);
    const event = { manufacturerDataBase64: "dadaa" };
    await endpoint.sendEvent(event);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const { validateStatus } = axiosPostMock.mock.calls[0][2] as { validateStatus: (n: number) => boolean };
    [200, 201].forEach((status) => expect(validateStatus(status)).toBeTruthy());
    [404, 302, 500].forEach((status) => expect(validateStatus(status)).toBeFalsy());
  });
});
*/
