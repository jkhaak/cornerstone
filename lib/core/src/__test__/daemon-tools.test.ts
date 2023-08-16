jest.mock("node:child_process");

import child_process from "node:child_process";
import * as daemonTools from "../daemon-tools.js";
import type { DaemonProps } from "../daemon-tools.js";
import os from "node:os";
import fs from "node:fs";

const forkOnMock = jest.fn();
const forkKillMock = jest.fn();

const fork = jest.fn().mockReturnValue({
  pid: 1,
  on: forkOnMock,
  kill: forkKillMock,
});

child_process.fork = fork;

jest.useFakeTimers();

describe("daemon tools", () => {
  let props: DaemonProps;
  const callbacks = {
    onError: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    props = {
      pidfile: `${os.tmpdir()}/test.pid`,
      modulePath: "test",
      args: ["test"],
      uid: -1,
      gid: -1,
      env: { hello: "world" },
    };
  });

  afterEach(() => {
    if (fs.existsSync(props.pidfile)) {
      fs.unlinkSync(props.pidfile);
    }
  });

  it.only("should check if the daemon is running", () => {
    const killFn = jest.fn();
    fork.mockReturnValueOnce({ pid: undefined, kill: killFn });

    daemonTools.daemonize(props, callbacks.onError, callbacks.onSuccess);

    expect(killFn).toBeCalledTimes(1);
    expect(fork).toBeCalledTimes(1);
    expect(callbacks.onError).toBeCalledTimes(1);
  });

  it("should start the daemon", () => {
    expect(fork).toBeCalledTimes(0);
    daemonTools.daemonize(props, callbacks.onError, callbacks.onSuccess);

    expect(fork).toBeCalledTimes(1);
    expect(fork).toBeCalledWith(props.modulePath, props.args, {
      detached: true,
      stdio: "ignore",
      uid: props.uid,
      gid: props.gid,
      env: props.env,
    });
  });

  it("should create a pidfile", () => {
    expect(fs.existsSync(props.pidfile)).toBe(false);
    daemonTools.daemonize(props, callbacks.onError, callbacks.onSuccess);
    expect(fs.existsSync(props.pidfile)).toBe(false);

    jest.advanceTimersByTime(2000);
    expect(fs.existsSync(props.pidfile)).toBe(true);
  });

  it("should call onSuccess when the daemon is running", () => {
    expect(callbacks.onSuccess).toBeCalledTimes(0);
    daemonTools.daemonize(props, callbacks.onError, callbacks.onSuccess);
    expect(callbacks.onSuccess).toBeCalledTimes(0);

    jest.advanceTimersByTime(2000);
    expect(callbacks.onSuccess).toBeCalledTimes(1);
  });

  it("should call onError when the daemon emits error event", () => {
    let thatCallback: (error: Error) => void = () => {
      expect(true).toBe(false);
    };

    forkOnMock.mockImplementation((event: string, callback: (error: Error) => void) => {
      if (event === "error") {
        thatCallback = callback;
      }
    });

    expect(forkOnMock).toBeCalledTimes(0);
    expect(callbacks.onError).toBeCalledTimes(0);
    daemonTools.daemonize(props, callbacks.onError, callbacks.onSuccess);
    expect(callbacks.onError).toBeCalledTimes(0);

    thatCallback(new Error("test"));
    expect(forkOnMock).toBeCalledTimes(2);

    expect(callbacks.onError).toBeCalledTimes(1);
  });

  it("should call onError when the daemon emits exit event", () => {
    let thatCallback: (code: number | null, signal: string | null) => void = () => {
      expect(true).toBe(false);
    };

    forkOnMock.mockImplementation(
      (event: string, callback: (code: number | null, signal: string | null) => void) => {
        if (event === "exit") {
          thatCallback = callback;
        }
      }
    );

    expect(forkOnMock).toBeCalledTimes(0);
    expect(callbacks.onError).toBeCalledTimes(0);
    daemonTools.daemonize(props, callbacks.onError, callbacks.onSuccess);
    expect(callbacks.onError).toBeCalledTimes(0);

    thatCallback(1, "test");
    expect(forkOnMock).toBeCalledTimes(2);

    expect(callbacks.onError).toBeCalledTimes(1);
  });
});
