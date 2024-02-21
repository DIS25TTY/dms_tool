//Health resolvers
const healthCheck = require("../../services/health")();
const mapVehicleToCustomer = require("../../services/mapCustomer")();
const vehicleDetails = require("../../services/vehicle")();
const customer = require("../../services/customer")();

const resolvers = {
  Mutation: {
    healthCheck: async () => {
      const response = await healthCheck.healthMutation();
      return true;
    },
    mapVehicleToCustomer: async (_, args, __, ___) => {
      const response = await mapVehicleToCustomer.mappingCustomerToVehicle(
        args
      );
      return response;
    },
    updateCustomerPayment: async (_, args, __, ___) => {
      const response = await customer.updateCustomerPayment(args.input);
      return response;
    },
    lockCustomer: async (_, args, __, ___) => {
      const response = await customer.lockCustomer(args);
      return response;
    },
    allocateVehicle: async (_, args, __, ___) => {
      const response = await customer.allocateVehicle(args);
      return response;
    },
    lockVehicle: async (_, args, __, ___) => {
      const response = await vehicleDetails.lockVehicle(args);
      return response;
    },
    allocateCustomer: async (_, args, __, ___) => {
      const response = await vehicleDetails.allocateCustomer(args);
      return response;
    },
    cancelAllocation: async (_, args, __, ___) => {
      const response = await mapVehicleToCustomer.cancelAllocation(args);
      return response;
    },
    changeOrderColor: async (_, args, __, ___) => {
      const response = await customer.changeOrderColor(args);
      return response;
    },
  },
};

module.exports = resolvers;
