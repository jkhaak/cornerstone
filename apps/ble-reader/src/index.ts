import { logger } from "@cornerstone/core";
import { createBluetooth } from "./services/bluetooth";
import { handleNewDevice } from "./services/ruuvi";

function main() {
  const bluetooth = createBluetooth();

  bluetooth
    .startDiscovery()
    .then(() => {
      bluetooth.on("newDevice", handleNewDevice);
    })
    .catch((error: unknown) => logger.error({ message: "unexpected error happened", error }));
}

main();
