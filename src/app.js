const express = require("express");
const cors = require("cors");
const { requestLoggerMiddleware, rTracer } = require("./utils/logger");
const { graphqlServerApp } = require("./graphql");
const { graphqlUploadExpress } = require("graphql-upload-minimal");
const { MAX_FILE_SIZE } = require('./utils/constant');
const cron = require('./utils/cron');

class App {
  constructor() {
    this.app = express();
    this.middleware();
  }

  middleware() {
    // Add middleware to parse JSON in the request body
    this.app.use(express.json());
    this.app.use(cors());

    //for logging
    this.app.use(requestLoggerMiddleware);

    //for trace logging
    this.app.use(rTracer.expressMiddleware());
  }

  expressApp() {
    //express instance
    return this.app;
  }

  async graphql() {
    this.app.use(
      graphqlUploadExpress({ maxFileSize: MAX_FILE_SIZE, maxFiles: "10" })
    );

    //graphql instance with express instance
    await graphqlServerApp(this.app);
  }
}

module.exports = () => new App();
