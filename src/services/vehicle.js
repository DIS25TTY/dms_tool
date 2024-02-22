const { fmt } = require("../configs");
const { CustomError, handleError } = require("../middlewares/errorHandler");
const {
  fetchAPIResponse,
  getByteBeamResponse,
  getVehicleList,
} = require("../utils/axios");
const prisma = require("../db/prisma");
const { timeOfExpiration, vehicle_ids } = require("../utils/constant");
const Helper = require("../utils/helper")();
const mapCustomer = require("./mapCustomer")();
const customer = require("./customer")();

class vehicleDetails {
  //getting the list for allocation
  getVehicleList = async () => {
    try {
      const countOfVehicles = await getByteBeamResponse("/count?status=active");
      const assignedVinFromOrderService = [];

      async function getVehicleDetails(count) {
        const vinNumber = await getByteBeamResponse(
          `?page=1&limit=${count}&status=active`
        );

        const vinToValidate = [];

        for (let i = 0; i < vinNumber.length; i++) {
          const vehicle = {
            vin: vinNumber[i].metadata.VIN,
            model:
              vinNumber[i].metadata.VIN.charAt(4) == 1
                ? "Simple One"
                : "Dot One",
            color: "Brazen Black",
            reg_no: vinNumber[i].metadata.Registration_Number,
            cloud_reg: "true",
          };
          // vinToValidate.push(vinNumber[i].metadata.VIN);
          vinToValidate.push(vehicle);
        }

        return vinToValidate;
      }

      //get the data and filter the
      const vinFromByteBeam = await getVehicleDetails(countOfVehicles);

      try {
        const response = await fetchAPIResponse(this.queryBuilder());

        for (let i = 0; i < response.getMappedVehicleVin.data.length; i++) {
          assignedVinFromOrderService.push(
            response.getMappedVehicleVin.data[i].vin
          );
        }
      } catch (error) {
        throw new CustomError("Something went wrong");
      }

      const vinsReadyForAllocation = vinFromByteBeam.filter(
        (items) => !assignedVinFromOrderService.includes(items)
      );

      console.log("ready for allocation", vinsReadyForAllocation);

      return null;
    } catch (error) {
      return handleError(error);
    }
  };

  queryBuilder() {
    let body = {
      query: `query getMappedVehicleDetails {
      getMappedVehicleVin {
        data {
          created_at
          is_verified
          model
          name
          order_id
          updated_at
          user_id
          vehicle_cloud_id
          vehicle_registration
          vin
          vehicle_model {
            color
            name
          }
          orders {
            order_number
            user {
              name
              user_id
            }
          }
        }
      }
    }`,
      operationName: "getMappedVehicleDetails",
    };
    return body;
  }

  //get the vehicle list from inventoryService
  getVehicleListFromInventoryService = async ({ id, page, limit, search }) => {
    try {
      if (page < 0 || limit < 0) {
        throw new CustomError("Page and limit must be positive");
      }

      let pageToPass = page == null || page == "" || page == 0 ? 1 : page;

      let limitToPass = limit == null || limit == "" || limit == 0 ? 10 : limit;

      let idToPass = id == null || "" ? "" : id;
      let searchToPass = search == null || "" ? "" : search;

      let query = this.queryBuilderForInventoryService(
        idToPass,
        pageToPass,
        limitToPass,
        searchToPass
      );

      const response = await getVehicleList(query);
      const inventoryData = response?.data.getNotAllocatedvehicle.data;
      return fmt.formatSuccessResponse("inventoryResponse", inventoryData);
    } catch (error) {
      return handleError(error);
    }
  };

  queryBuilderForInventoryService(id, page, limit, search) {
    const body = {
      query: `query VehicleSuccessResponse{
        getNotAllocatedvehicle(id: "${id}", page : ${page}, limit : ${limit}, search: "${search}") {
          ... on vehicleSuccessResponse {
            data {
              vehicle_id
              model
              color
              vin
              cloud_registered
              registration
            }
            success
          }
          ... on Error {
            success
            message
            statusCode
          }
        }
      }`,
      operationName: "VehicleSuccessResponse",
    };

    return body;
  }

  //lock the vehicle
  lockVehicle = async ({ vin, vehicle_id, locked_by }) => {
    try {
      if (!Helper.validateUuid(vehicle_id)) {
        throw new CustomError("Invalid input");
      }

      if (!vehicle_ids.includes(vehicle_id)) {
        throw new CustomError("Invalid vehicle_id");
      }

      if (!locked_by) {
        throw new CustomError("Dealer details needed");
      }
  
    // Check if the VIN exists in the database
    const vinExists = await prisma.map_customer.findFirst({
      where: {
        vin: vin,
      },
    });

    if (!vinExists) {
      throw new CustomError("VIN does not exist");
    }
      //check if vin already allocated
      const vinCheck = await prisma.map_customer.findFirst({
        where: {
          vin: vin,
        },
      });

      if (vinCheck && vinCheck.status == "allocated") {
        throw new CustomError("vin already allocated");
      }

      //check in inventory service
      const query = customer.vinCheckQuery(vin, vehicle_id);
      const result = await getVehicleList(query);

      if (!result.data.checkVin?.success) {
        throw new CustomError(result.data.checkVin?.message);
      }

      if (!result.data.checkVin?.message.includes("not allocated")) {
        throw new CustomError(result.data.checkVin?.message);
      }

      const response = await this.functionLockVehicle(
        vehicle_id,
        locked_by,
        vin
      );

      if (response.__typename == "Error") {
        return response;
      }

      return fmt.formatSuccessMutation({
        data_id: vin,
        message: response,
      });
    } catch (error) {
      return handleError(error);
    }
  };

  functionLockVehicle = async (vehicle_id, locked_by, vin) => {
    const lockExpirationTimestamp = new Date(
      Date.now() + timeOfExpiration * 60 * 1000
    );

    const transaction = await prisma.$transaction(async (prisma) => {
      await prisma.$executeRaw`BEGIN;`;

      try {
        //check for vehicle if it is locked or not
        const vehicleCheck = await prisma.map_customer.findFirst({
          where: {
            vehicle_id: vehicle_id,
            vin: vin,
          },
        });

        if (vehicleCheck) {
          if (vehicleCheck.status == "allocated") {
            throw new CustomError("order already allocated");
          }

          if (vehicleCheck.status == "locked") {
            const expiration = vehicleCheck.lock_expires;
            if (expiration < new Date()) {
              await prisma.map_customer.delete({
                where: {
                  vehicle_id: vehicle_id,
                  vin: vin,
                  status: "locked",
                },
              });

              return "Lock Expired";
            } else {
              if (vehicleCheck.locked_by == locked_by) {
                return "Proceed to customer allocation";
              } else {
                throw new CustomError(`locked by ${vehicleCheck.locked_by}`);
              }
            }
          } else {
            throw new CustomError(`status ${vehicleCheck.status}`);
          }
        }

        //vehicle is not locked or create a new entry
        const id = Helper.generateUuid();

        await prisma.map_customer.create({
          data: {
            id: id,
            vehicle_id: vehicle_id,
            vin: vin,
            created_at: new Date(),
          },
        });

        // Attempt to lock the customer row for the specified duration
        const vehicleLockResult = await prisma.$executeRaw`
          SELECT * FROM map_customer
          WHERE vin = ${vin}
          -- AND status = 'ok'
          FOR UPDATE NOWAIT;
        `;
        // Check if the customer row is successfully locked
        if (vehicleLockResult && vehicleLockResult.toString().length > 0) {
          // Update the customer status and set the lock expiration timestamp
          await prisma.map_customer.update({
            where: {
              vin: vin,
              vehicle_id: vehicle_id,
              id: id,
            },
            data: {
              status: "locked",
              updated_at: new Date(Date.now()),
              locked_by: locked_by,
              lock_expires: lockExpirationTimestamp,
            },
          });

          // Commit the transaction
          await prisma.$executeRaw`COMMIT;`;

          // Customer locked successfully
          return "vehicle locked successfully";
        } else {
          // Locking failed (vehicle row is locked or not found)
          console.log("rolling back");
          await prisma.$executeRaw`ROLLBACK;`;
          throw new CustomError("Error while locking");
        }
      } catch (error) {
        // Handle any errors that occurred during the transaction
        console.error("Transaction error:", error);
        // Roll back the transaction
        await prisma.$executeRaw`ROLLBACK;`;
        // throw new CustomError("Locking failed");
        return handleError(error);
      }
    });
    return transaction;
  };

  //allocate vehicle
  allocateCustomer = async ({ allocated_vehicle_id, vin, customer_id, locked_by, order_id, ordered_vehicle_id }) => {
    try {

      if(allocated_vehicle_id != ordered_vehicle_id){
        throw new CustomError("color mismatch");
      }

      if (!Helper.validateUuid(customer_id) || !Helper.validateUuid(order_id)) {
        throw new CustomError("Invalid input");
      }

      if (!locked_by) {
        throw new CustomError("Dealer details needed");
      }

      //check the status
      const customerCheck = await prisma.map_customer.findFirst({
        where: {
          user_id: customer_id,
          order_id: order_id,
        },
      });

      if (customerCheck && customerCheck.status == "allocated") {
        throw new CustomError("Order already allocated");
      }

      //before locking the customer check in order service if it belongs to the user
      const query = customer.checkCustomerOrderQuery(order_id, customer_id, 1);
      const result = await fetchAPIResponse(query);

      if (!result.checkCustomerOrder?.success) {
        throw new CustomError(result.checkCustomerOrder?.message);
      }

      const response = await this.functionAllocateCustomer(
        vin,
        customer_id,
        locked_by,
        order_id
      );

      if (response.__typename == "Error") {
        return response;
      }

      //update the same in dms
      const body = mapCustomer.mutationForStatusUpdate(vin, "allocated");
      const updateStatus = await getVehicleList(body);


      return fmt.formatSuccessMutation({
        data_id: vin,
        message: response,
      });
    } catch (error) {
      return handleError(error);
    }
  };

  functionAllocateCustomer = async (vin, customer_id, locked_by, order_id) => {
    try {
      //check if the customer is already locked by someOne
      const customer = await prisma.map_customer.findFirst({
        where: {
          user_id: customer_id,
          order_id: order_id,
          status: "locked",
          locked_by: {
            not: locked_by,
          },
        },
      });

      if (customer) {
        throw new CustomError("customer already locked");
      }

      //check if vehicle is locked
      const lockedVehicleDetails = await prisma.map_customer.findFirst({
        where: {
          vin: vin,
          // order_id: order_id,
        },
      });

      if (!lockedVehicleDetails) {
        throw new CustomError("Vehicle not locked");
      }

      if (lockedVehicleDetails.status == "allocated") {
        throw new CustomError("Vehicle already allocated");
      }

      if (!lockedVehicleDetails.locked_by == locked_by) {
        throw new CustomError(`locked by ${lockedVehicleDetails}`);
      }

      const expiration = lockedVehicleDetails.lock_expires;
      if (expiration < new Date()) {
        //delete the allocated vehicle
        await prisma.map_customer.delete({
          where: {
            // order_id: {
            //   not: null,
            // },
            vin: vin,
            status: "locked",
            // lock_expires: {
            //   lt: new Date(Date.now()),
            // },
          },
        });

        return "Lock expired";
      }

      try {
        await prisma.$transaction(async (prisma) => {
          const updateVehicle = await prisma.map_customer.update({
            where: {
              // order_id: order_id,
              vin: vin,
            },
            data: {
              lock_expires: null,
              locked_by: locked_by,
              status: "allocated",
              order_id: order_id,
              user_id: customer_id,
            },
          });
        });
      } catch (error) {
        throw new CustomError("Error while Allocating customer");
      }

      return "Customer Allocated";
    } catch (error) {
      return handleError(error);
    }
  };

  //getting the count of allocated and not allocated vehicles
  getVehicleCount = async () => {
    try {
      const query = this.queryForCount();
      const count = await getVehicleList(query);

      if (count.data.getCount?.success == true) {
        return fmt.formatSuccessResponse("countResponse", count);
      }

      throw new CustomError("Something went wrong");
    } catch (error) {
      return handleError(error);
    }
  };

  queryForCount() {
    let body = {
      query: `query CountResponse {
        getCount {
          ... on countResponse {
            data {
              allocatedCount
              notAllocatedCount
            }
            success
          }
          ... on Error {
            success
            message
            statusCode
          }
        }
      }`,
      operationName: "CountResponse",
    };

    return body;
  }
}

module.exports = () => new vehicleDetails();
