const Formatter = require("../utils/formatter")();
const dotenv = require("dotenv");
const path = require("path");
// const env = require('../../.env.development');

if (!process.env.NODE_ENV) {
  dotenv.config({ path: ".env" });
} else if (process.env.NODE_ENV === "STAGE") {
  dotenv.config("../../.env.stage");
} else {
  dotenv.config({ path: ".env" });
}

const Config = require("./config");
const config = new Config(process.env);
const fmt = Formatter;

module.exports = { config, fmt };
