import { Command } from "commander";
import { parseConfig } from "./config";
import { run } from "./run";
import { fork } from "node:child_process";
import { logger } from "@cornerstone/core";
import fs from "node:fs";
import _ from "lodash";

const program = new Command();

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
    run(parseConfig(options.config));
  });

program
  .command("daemon")
  .description("run as a daemon")
  .requiredOption("-c, --config <path>", "path to config file")
  .option("-p, --pidfile <path>", "path to pidfile")
  .action((options: DaemonOptions) => {
    const { daemon } = parseConfig(options.config);

    if (!daemon) {
      logger.error({ message: "Daemon config missing" });
      process.exit(4);
    }

    const pidfile = [options.pidfile, daemon.pidfile].find((x) => _.isString(x));

    if (!pidfile) {
      logger.error({ message: "Pidfile not configured" });
      process.exit(7);
    }

    const { gid, uid } = daemon;
    const childOpts = {
      detatched: true,
      uid,
      gid,
      env: {
        LOG_LEVEL: "ERROR",
      },
    };
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
      process.exit(0);
    }, 2000);

    child.on("exit", (code) => {
      clearTimeout(checkAlive);
      logger.error({ message: "Daemon exited unexpectedly", code });
      process.exit(8);
    });

    child.on("error", (err) => {
      clearTimeout(checkAlive);
      logger.error({ message: "Daemon failed", error: err });
      process.exit(6);
    });
  });

program.parse();
