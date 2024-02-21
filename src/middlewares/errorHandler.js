const { fmt } = require("../configs");
const { logger } = require("../utils/logger");

class CustomError extends Error {
  constructor(message, errorCode) {
    super(message, errorCode);
  }
}

exports.handleError = (error) => {
  console.log(error);
  logger.error(error);
  
  if (error instanceof CustomError) {
    return fmt.formatErrorResponse(error.message, error.errorCode);
  }
  return fmt.formatErrorResponse();
};

exports.CustomError = CustomError;
