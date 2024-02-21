//Health check resolvers
const healthCheck = require("../../services/health")();
const customerDetails = require("../../services/customer")();
const vehicleDetails = require("../../services/vehicle")();
const version = require("../../services/version")();

const resolvers = {
  Query: {
    //Health Queries
    health: async () => {
      const response = await healthCheck.healthQuery();
      return response;
    },
    getCustomerDetailsByMobile: async (_, args, __, ___) => {
      const response = await customerDetails.getCustomerDetailsByPhone(args);
      return response;
    },
    getByteBeamData: async (_, args, __, ___) => {
      const response = await vehicleDetails.getVehicleList();
      return response;
    },
    getInventoryList: async (_, args, __, ___) => {
      const response = await vehicleDetails.getVehicleListFromInventoryService(
        args
      );
      return response;
    },
    getAllCustomer: async (_, args, __, ___) => {
      const response = await customerDetails.getAllCustomer(args);
      return response;
    },
    getVehicleCount: async (_, args, __, ___) => {
      const response = await vehicleDetails.getVehicleCount(args);
      return response;
    },
    getServiceVersion: async (_, args, __, ___) => {
      const response = await version.getServiceVersion(args);
      return response;
    },
  },
};

module.exports = resolvers;
