import { Command } from "commander";
import { logger, daemonTools } from "@cornerstone/core";
import { getConfig, type DaemonConfig } from "./model.js";
import { run } from "./run.js";

export const program = new Command();

export type RunOptions = {
  config: string;
};

export type DaemonOptions = RunOptions & {
  pidfile: string;
};

program.name("hub").description("CLI tool for managing a cornerstone hub").version("0.0.1");

program
  .command("run", { isDefault: true })
  .description("run the program in foreground (default)")
  .requiredOption("-c, --config <path>", "path to config file")
  .action((options: RunOptions) => {
    run(getConfig(options.config));
  });

program
  .command("daemon")
  .description("run as a daemon")
  .requiredOption("-c, --config <path>", "path to config file")
  .requiredOption("-p, --pidfile <path>", "path to pidfile")
  .action((options: DaemonOptions) => {
    const { pidfile } = options;
    let daemonConfig: DaemonConfig;

    try {
      daemonConfig = getConfig(options.config).daemon;
    } catch (error) {
      logger.error({ message: "Daemon config missing", error });
      process.exit(5);
    }

    const { gid = 1000, uid = 1000 } = daemonConfig;
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
