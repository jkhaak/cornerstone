import { Command } from "commander";
import { run } from "./run";
import { logger, daemonTools } from "@cornerstone/core";
import { isString } from "lodash";
import { getConfig } from "./model";
import type { DaemonConfig } from "./model";

export const program = new Command();

export type RunOptions = {
  config: string;
};

export type DaemonOptions = RunOptions & {
  pidfile?: string;
};

program
  .name("ble-reader")
  .description("CLI tool for reading ruuvi tag advertisements and publishing them via mqtt")
  .version("0.0.1");

program
  .command("run", { isDefault: true })
  .description("run the program in foreground (default)")
  .requiredOption("-c, --config <path>", "path to config file")
  .action((options: RunOptions) => {
    run(getConfig(options.config).mqtt);
  });

program
  .command("daemon")
  .description("run as a daemon")
  .requiredOption("-c, --config <path>", "path to config file")
  .option("-p, --pidfile <path>", "path to pidfile")
  .action((options: DaemonOptions) => {
    let daemon: DaemonConfig;

    try {
      daemon = getConfig(options.config).daemon;
    } catch (error) {
      logger.error({ message: "Daemon config missing", error });
      process.exit(5);
    }

    const pidfile = [options.pidfile, daemon?.pidfile].find(isString);

    if (!pidfile) {
      logger.error({ message: "Pidfile not configured" });
      process.exit(7);
    }

    const { gid = 1000, uid = 1000 } = daemon ?? {};

    const props = {
      pidfile,
      modulePath: __filename,
      args: ["run", "-c", options.config],
      uid,
      gid,
      env: {
        LOG_LEVEL: "ERROR",
      },
    } satisfies daemonTools.DaemonProps;

    daemonTools.daemonize(props);
  });
