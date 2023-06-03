import { environment, logger } from "@cornerstone/core";
import { createBluetooth } from "./services/bluetooth";
import { RuuviService } from "./services/ruuvi";
import { Endpoint } from "./services/endpoint";
import type { NewDeviceEventParams } from "./services/bluetooth";

const envServiceEndpointUrl = "SERVICE_ENDPOINT_URL";
const SERVICE_ENDPOINT_URL = environment.getEnv(envServiceEndpointUrl);

if (SERVICE_ENDPOINT_URL === undefined) {
  logger.error({ message: `Environment variable ${envServiceEndpointUrl} is not set` });
  logger.debug({ env: process.env });
  process.exit(0);
}

const endpointService = new Endpoint(SERVICE_ENDPOINT_URL);

function main() {
  const bluetooth = createBluetooth();
  const ruuviService = new RuuviService(endpointService);

  bluetooth
    .startDiscovery()
    .then(() => {
      bluetooth.on("newDevice", (...args: NewDeviceEventParams) => ruuviService.handleNewDevice(...args));
    })
    .catch((error: unknown) => logger.error({ message: "unexpected error happened", error }));
}

main();
