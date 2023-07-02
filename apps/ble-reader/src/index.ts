import { Command } from "commander";
import { logger } from "@cornerstone/core";

const program = new Command();

type RunOptions = {
  environment: boolean;
  config?: string;
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
  .option("-e, --environment", "read config from environment variables (default)", true)
  .option("-c, --config <path>", "path to config file")
  .action((options: RunOptions) => {
    logger.info({ message: "run mode not implemented yet", options });
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
