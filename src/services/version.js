const pjson = require("../../package.json");
const { fmt } = require("../configs");
const { handleError, CustomError } = require("../middlewares/errorHandler");

class versionDetails {
  getServiceVersion = async () => {
    try {
      const version = pjson.version;

      const response = {
        serviceName: "DMS",
        version: version,
      };

      return fmt.formatSuccessResponse("versionDetails", {
        data: response,
      });
    } catch (error) {
      return handleError(error);
    }
  };
}

module.exports = () => new versionDetails();
