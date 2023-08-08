import { Command } from "commander";
import { parseConfig } from "./config";
import { run } from "./run";
import { fork } from "node:child_process";
import { logger } from "@cornerstone/core";
import fs from "node:fs";

const program = new Command();

export type Options = {
  config: string;
};

program
  .name("ble-reader")
  .description("CLI tool for reading ruuvi tag advertisements and publishing them via mqtt")
  .version("0.0.1");

program
  .command("run", { isDefault: true })
  .description("run the program in foreground (default)")
  .requiredOption("-c, --config <path>", "path to config file")
  .action((options: Options) => {
    run(parseConfig(options.config));
  });

program
  .command("daemon")
  .description("run as a daemon")
  .requiredOption("-c, --config <path>", "path to config file")
  .action((options: Options) => {
    const { daemon } = parseConfig(options.config);

    if (!daemon) {
      logger.error({ message: "Daemon config missing" });
      process.exit(4);
    }

    const { gid, uid, pidfile } = daemon;
    const childOpts = { detatched: true, uid, gid };
    const child = fork(__filename, ["run", "-c", options.config], childOpts);
    const { pid } = child;

    if (!pid) {
      logger.error({ message: "Could not get child pid" });
      child.kill();
      process.exit(5);
    }

    const checkAlive = setTimeout(() => {
      fs.writeFileSync(pidfile, pid.toString());
      logger.info({ message: "Daemon started", pid });
    }, 1000);

    child.on("error", (err) => {
      clearTimeout(checkAlive);
      logger.error({ message: "Daemon failed", error: err });
      process.exit(6);
    });
  });

program.parse();
