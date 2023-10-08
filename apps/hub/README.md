# Hub

Collects mqtt data and stores it to database.

## Requirements

For running hub requires node.js 18, mqtt server (mosquitto will do) and postgresql database up and running.

For building you need to have node.js 18 and @microsoft/rush installed.

## Installation

1. Install dependencies with `rush install`.
2. Build the hub with `rushx bundle`.
3. Copy the `dist/bin.js` to appropriate place, like `/opt/bin` or use global link with `rushx link`.
```sh
cp dist/bin.js /opt/bin/hub
```

## OpenRC daemon

Create config `/etc/hub/config.json` for the hub daemon. For example:

```json
{
  "mqtt": {
    "url": "mqtt://",
    "username": "mqttuser",
    "password": "mqttpassword"
  },
  "database": {
    "cn": "postgresql://hub:hub@localhost/hub"
  },
  "daemon": {
    "uid": 1000,
    "gid": 1000
  }
}
```

Then create the init script `/etc/init.d/hub`.

```sh
#!/sbin/openrc-run

config="/etc/hub/config.json"
pidfile="/run/${RC_SVCNAME}.pid"
command="/opt/bin/hub"
command_args="daemon -p ${pidfile} -c ${config}"

depend() {
    need mosquitto postgresql
}
```
