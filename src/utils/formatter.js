class Formatter {
  formatError = (error) => {
    const status = error.status || 500;
    const message = error.message || "Something went wrong";
    const code = error.code || "E500";
    const data = null;
    const success = false;
    return {
      status,
      message,
      data,
      success,
      code,
    };
  };

  formatResponse = (result, message) => {
    let data = null;
    let success = false;
    const code = "S200";

    data = result;
    success = true;

    const response = {
      data,
      message: message ? message : "",
      success,
      code,
    };
    return response;
  };

  getSwaggerResponse = (data) => {
    const response = {
      message: { type: "string" },
      success: { type: "boolean" },
      code: { type: "string" },
    };
    if (data !== undefined) response.data = data;
    return response;
  };

  formatErrorResponse = (
    message = "Something went wrong",
    errorCode = "500"
  ) => {
    if (
      message.includes("exists") ||
      message.includes("already" || message.includes("not"))
    ) {
      errorCode = "409";
    } else if (message.includes("Db")) {
      errorCode = "500";
    } else if (!message.startsWith("Something")) {
      errorCode = "400";
    }
    return {
      __typename: "Error",
      success: false,
      message,
      statusCode: errorCode,
    };
  };

  formatSuccessResponse = (type, data) => {
    // console.log({
    //   __typename: type,
    //   success: true,
    //   data: data,
    // });
    if (
      type == "customerResponse" ||
      type == "customersResponse" ||
      type == "countResponse"
    ) {
      return {
        __typename: type,
        success: true,
        data: data.data,
      };
    }

    return {
      __typename: type,
      success: true,
      data: data,
    };
  };

  formatSuccessMutation = ({
    data_id,
    message = "",
    type = "successResponse",
  }) => {
    return {
      __typename: type,
      success: true,
      // data_id: data_id,
      message: message,
    };
  };
}

module.exports = () => new Formatter();
