const rTracer = require("cls-rtracer");
const { config } = require("../configs");
const morgan = require("morgan");

const logger = require("pino")({
  level: config.env === "STAGE" ? "error" : "info",
  mixin() {
    const requestId = rTracer.id();
    return {
      requestId,
    };
  },
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname,requestId",
      messageFormat: "[{requestId}]: {msg}",
      colorize: false,
      destination: "./logs.log",
    },
  },
  serializers: {
    req(request) {
      let body = undefined;
      if (request.body && request.headers["content-type"] == "application/json")
        body = request.body;
      return {
        method: request.method,
        url: request.url,
        operationName : body.operationName,
        ip: request.ip,
        ips: request.ips,
      };
    },
  },
});

morgan.token("id", (req) => rTracer.id());
morgan.token("response-size", (req, res) => res.get("Content-Length"));
morgan.token("processing-time", (req) => {
  return Date.now() - req.startTime;
});

const morganLogFormat = `
:date[clf] :id ${process.pid} :remote-addr :response-size :response-time ms :processing-time ms :status :url :method :url :http-version
`;

const requestLoggerMiddleware = morgan(morganLogFormat);

module.exports = { logger, rTracer , requestLoggerMiddleware, morgan };
