import { Command } from "commander";
import { logger } from "@cornerstone/core";
import { parseConfig } from "./config";
import { run } from "./run";

const program = new Command();

type RunOptions = {
  config: string;
};

type DaemonOptions = {
  config: string;
  pidfile: string;
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
    run(parseConfig(options.config));
  });

program
  .command("daemon")
  .description("run as a daemon")
  .requiredOption("-c, --config <path>", "path to config file")
  .requiredOption("-p, --pidfile <path>", "path to pid file")
  .action((options: DaemonOptions) => {
    logger.info({ message: "daemon mode not implemented yet", options });
  });

program.parse();
