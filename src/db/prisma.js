const { PrismaClient } = require("@prisma/client");
const { config } = require("../configs");
const { logger } = require("../utils/logger");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_IP_URL,
    },
  },
});

module.exports = prisma;