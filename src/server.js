const { config } = require("./configs");
const App = require("./app")();
const prisma = require("./db/prisma");
const { logger } = require("./utils/logger");

class Server {
  constructor() {
    this.appInstance = App.expressApp();
  }

  start() {
    this.appInstance.listen({ port: config.port, host: "0.0.0.0" }, (err) => {
      if (err) {
        logger.error(
          `[DMS Service]-[listen] error starting the server @ http://0.0.0.0:${config.port} with error ${err}`
        );
        console.log(err);
        process.exit(1);
      }
      console.log(`server listening on http://0.0.0.0:${config.port}`);
      logger.info("Server Started");

      App.graphql(this.appInstance);
    });
  }
}

const server = new Server();
server.start();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma client disconnected. Exiting...");
  process.exit();
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("Prisma client disconnected. Exiting...");
  process.exit();
});
