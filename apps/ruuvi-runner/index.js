const noble = require("@abandonware/noble");
const { ruuviCollector } = require("ruuvi-parser");

ruuviCollector({ noble });
