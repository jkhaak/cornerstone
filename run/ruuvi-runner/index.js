const noble = require("@abandonware/noble");
const { ruuviCollector } = require("ruuvi-collector");

ruuviCollector({ noble });
