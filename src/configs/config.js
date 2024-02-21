class Config {
  NODE_ENV = "DEVELOPMENT" | "PRODUCTION" | "STAGE" | "LOCAL";
  constructor(env) {
    this.NODE_ENV = env.NODE_ENV || "DEVELOPMENT";
    this.port = this.getNumber(env.PORT);
    this.DATABASE_IP_URL = env.DATABASE_URL;
    this.REQUEST_URL = env.REQUEST_URL;
    this.REQUEST_METHOD = env.REQUEST_METHOD;
    this.X_API_KEY = env.X_API_KEY_DEV;
    this.BYTE_BEAM_REQUEST_URL = env.BYTE_BEAM_REQUEST_URL;
    this.BYTE_BEAM_REQUEST_METHOD = env.BYTE_BEAM_REQUEST_METHOD;
    this.BYTE_BEAM_X_API_KEY = env.BYTE_BEAM_X_API_KEY;
    this.INVENTORY_SERVICE_URL = env.INVENTORY_SERVICE_URL;
  }

  getNumber(value) {
    return Number(value);
  }
}

module.exports = Config;
