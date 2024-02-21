const { fmt } = require("../configs");
const prisma = require("../db/prisma");
const { handleError, CustomError } = require("../middlewares/errorHandler");
const { fetchAPIResponse, getVehicleList } = require("../utils/axios");
const helper = require("../utils/helper")();

class mapCustomer {
  mappingCustomerToVehicle = async ({
    vin,
    user_id,
    model,
    name,
    vehicle_registration,
    order_id,
  }) => {
    try {
      let body = this.mutationBuilder(
        vin,
        user_id,
        model,
        name,
        vehicle_registration,
        order_id
      );

      const response = await fetchAPIResponse(body);

      if (!response.mapVehicleToCustomer.data) {
        throw new CustomError(response.mapVehicleToCustomer.message);
      }

      //trigger the inventory service to update status
      const updateStatusQuery = this.mutationForStatusUpdate(vin, "delivered");
      const updateStatus = await getVehicleList(updateStatusQuery);

      console.log(updateStatus);

      //trigger the dms service to update status
      // const

      return fmt.formatSuccessMutation({
        message: "Mapped successfully",
      });
    } catch (error) {
      return handleError(error);
    }
  };

  mutationForStatusUpdate(vin, status) {
    let body = {
      query: `mutation ChangeStatus {
        changeStatus(vin: "${vin}", status: ${status}) {
          ... on successResponse {
            success
            message
          }
          ... on Error {
            success
            message
            statusCode
          }
        }
      }`,
      operationName: "ChangeStatus",
    };

    return body;
  }

  mutationBuilder(vin, user_id, model, name, vehicle_registration, order_id) {
    let body = {
      query: `mutation mappingVehicle {
            mapVehicleToCustomer(model:"${model}", name:"${name}",order_id:"${order_id}",user_id:"${user_id}",vehicle_registration:"${vehicle_registration}",vin:"${vin}") {
              message
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
              }
            }
          }
          `,
      operationName: "mappingVehicle",
    };

    return body;
  }

  //cancel the allocation
  cancelAllocation = async ({ vin, order_id }) => {
    try {
      if (!vin && !order_id) {
        throw new CustomError("Invalid input");
      }

      const query = {};

      if (vin) {
        query.where = {
          vin: vin,
        };
      }
      if (order_id) {
        query.where = {
          ...query.where,
          order_id: order_id,
        };
      }

      //check if the status is allocated
      const checkStatus = await prisma.map_customer.findFirst(query);
      if (!checkStatus) {
        throw new CustomError("No entries found");
      }

      if (checkStatus.status == "allocated") {
        await prisma.$transaction(async (prisma) => {
          //delete it from map customer table
          await prisma.map_customer.delete(query);

          if (vin) {
            //change the status in dms as not allocated
            const query = await this.mutationForStatusUpdate(
              vin,
              "not_allocated"
            );
            const updateStatus = await getVehicleList(query);

            console.log("DATA", updateStatus);
            if (updateStatus.__typename == "Error") {
              throw new CustomError("Error at updating inventory service");
            }
          }
        });

        return fmt.formatSuccessMutation({
          message: "Cancelled successfully",
        });
      }

      throw new CustomError(`status is ${checkStatus.status}`);
    } catch (error) {
      return handleError(error);
    }
  };

}

module.exports = () => new mapCustomer();
