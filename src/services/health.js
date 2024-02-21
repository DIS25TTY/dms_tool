const { fmt } = require("../configs");
const { CustomError, handleError } = require("../middlewares/errorHandler");
const prisma = require("../db/prisma");

class Health {
  healthQuery = async () => {
    try {
      const healthResponse = {
        success: true,
        message: "Health check successful",
        uptime: process.uptime(),
      };

      try {
        const result = await prisma.$executeRaw`SELECT 1+1 as result;`;
      } catch (error) {
        throw new CustomError("Db Connection Error", error);
      }
      return fmt.formatSuccessResponse("HealthSuccess", healthResponse);
    } catch (error) {
      return handleError(error);
    }
  };

  healthMutation = async () => {
    try {
      return true;
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = () => new Health();
