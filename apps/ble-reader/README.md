# ble-reader

ble-reader reads bluetooth low energy advertisements through dbus and sends decoded data via mqtt broker. Currently ble-reader only supports Ruuvi tag data format 5.

## Requirements

For running ble-reader requires node.js 18, dbus and mqtt server (mosquitto will do) up and running.

For building you need to have node.js 18 and @microsoft/rush installed.

## Installation

1. Install dependencies with `rush install`.
2. Build the ble-reader with `rushx bundle`.
3. Copy the `dist/bin.js` to appropriate place, like `/opt/bin` or use global link with `rushx link`.
```sh
cp dist/bin.js /opt/bin/ble-reader
```

## OpenRC daemon

Create config `/etc/ble-reader/config.json` for the ble-reader daemon. For example:

```json
{
  "mqtt": {
    "url": "mqtt://127.0.0.1:1883",
    "username": "mqttuser",
    "password": "mqttpassword"
  },
  "daemon": {
    "uid": 1000,
    "gid": 1000
  }
}
```

Then create the init script `/etc/init.d/ble-reader`.

```sh
#!/sbin/openrc-run

config="/etc/ble-reader/config.json"
pidfile="/run/${RC_SVCNAME}.pid"
command="/opt/bin/ble-reader"
command_args="daemon -p ${pidfile} -c ${config}"

depend() {
    need dbus mosquitto
}
```

## Storing data to database with hub

See instructions from [hub](../hub/README.md).

## Homebridge MQTTThing

Example config for collecting ruuvi events with [MQTTThing](https://github.com/arachnetech/homebridge-mqttthing).

```json
{
    "type": "weatherStation",
    "name": "<Name>",
    "url": "mqtt://127.0.0.1:1883",
    "username": "mqttuser",
    "password": "mqttpassword",
    "topics": {
        "getAirPressure": {
            "topic": "ruuvi/event/<RuuviID>",
            "apply": "return JSON.parse(message).pressure / 100"
        },
        "getBatteryLevel": {
            "topic": "ruuvi/event/<RuuviID>",
            "apply": "return (JSON.parse(message).power.voltage / 3.646 * 100)"
        },
        "getStatusLowBattery": {
            "topic": "ruuvi/event/<RuuviID>",
            "apply": "return (JSON.parse(message).power.voltage / 3.646 * 100) < 20"
        },
        "getCurrentRelativeHumidity": {
            "topic": "ruuvi/event/<RuuviID>",
            "apply": "return JSON.parse(message).humidity"
        },
        "getCurrentTemperature": {
            "topic": "ruuvi/event/<RuuviID>",
            "apply": "return JSON.parse(message).temperature"
        }
    },
    "logMqtt": false,
    "accessory": "mqttthing"
}
```
