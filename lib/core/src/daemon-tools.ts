import { fork } from "node:child_process";
import fs from "node:fs";
import { logger } from "./index";

export type DaemonProps = {
  pidfile: string;
  modulePath: string;
  args: string[];
  uid: number;
  gid: number;
  env: { [key: string]: string };
};

export type OnErrorCallback = (error: Error) => void;

export type OnSuccessCallback = () => void;

function exit(code: number) {
  return () => process.exit(code);
}

export function daemonize(
  props: DaemonProps,
  onError?: OnErrorCallback,
  onSuccess?: OnSuccessCallback
): void {
  const { uid, gid, modulePath, args, pidfile, env } = props;
  const child = fork(modulePath, args, { detached: true, uid, gid, env, stdio: "ignore" });
  const { pid } = child;
  const onErrorCb = onError ?? exit(1);
  const onSuccessCb = onSuccess ?? exit(0);

  if (!pid) {
    logger.error({ message: "Could not get child pid" });
    child.kill();
    return onErrorCb(new Error(`Could not get child pid`));
  }

  const checkAlive = setTimeout(() => {
    fs.writeFileSync(pidfile, pid.toString());
    logger.info({ message: "Daemon started", pid });
    onSuccessCb();
  }, 2000);

  child.on("exit", (code) => {
    clearTimeout(checkAlive);
    logger.error({ message: "Daemon exited unexpectedly", code });
    onErrorCb(new Error(`Daemon exited unexpectedly`));
  });

  child.on("error", (err) => {
    clearTimeout(checkAlive);
    logger.error({ message: "Daemon failed", error: err });
    onErrorCb(new Error(`Daemon failed: ${err.toString()}`));
  });
}
