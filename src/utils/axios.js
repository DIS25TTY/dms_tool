const axios = require("axios");
const { handleError, CustomError } = require("../middlewares/errorHandler");
const { config } = require("../configs");

const headers = {
  "Content-Type": "application/json",
  "x-api-key": config.X_API_KEY,
};

//from order service
async function fetchAPIResponse(body) {
  try {
    const { data } = await axios({
      method: config.REQUEST_METHOD,
      url: config.REQUEST_URL,
      headers,
      // params,
      data: body,
    });

    const response = data.data;
    return response;
  } catch (error) {
    return handleError(error);
  }
}

//from bytebeam
async function getByteBeamResponse(endpoint) {
  try {
    const headers = {
      "x-bytebeam-api-key": config.BYTE_BEAM_X_API_KEY,
    };

    const { data } = await axios({
      method: config.BYTE_BEAM_REQUEST_METHOD,
      url: `${config.BYTE_BEAM_REQUEST_URL}${endpoint}`,
      headers,
      // params,
      // data: body,
    });
    return data;
  } catch (error) {
    return handleError(error);
  }
}

//from inventory service
async function getVehicleList(body) {
  try {
    const { data } = await axios({
      method: config.REQUEST_METHOD,
      url: config.INVENTORY_SERVICE_URL,
      data: body,
    });
    return data;
  } catch (error) {
    return handleError(error);
  }
}

module.exports = { fetchAPIResponse, getByteBeamResponse, getVehicleList };
