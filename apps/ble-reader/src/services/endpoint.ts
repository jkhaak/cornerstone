import axios from "axios";

export type Event = {
  manufacturerDataBase64: string;
};

export class Endpoint {
  private _endpoint: string;

  public constructor(endpoint: string) {
    this._endpoint = endpoint;
  }

  public sendEvent(event: Event) {
    return axios.post(`${this._endpoint}/ruuvi/event`, event, {
      validateStatus: (status) => status === 200 || status === 201,
    });
  }
}
