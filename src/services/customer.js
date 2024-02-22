const { fmt } = require("../configs");
const { CustomError, handleError } = require("../middlewares/errorHandler");
const { fetchAPIResponse, getVehicleList } = require("../utils/axios");
const { timeOfExpiration, vehicle_ids } = require("../utils/constant");
const prisma = require("../db/prisma");
const Helper = require("../utils/helper")();
const mapCustomer = require("./mapCustomer")();

class customerDetails {
  //get all customers from order service
  getAllCustomer = async ({ limit, page, search }) => {
    try {
      let limitToPass = limit == null || "" ? 10 : limit;
      let pageToPass = page == null || "" ? 1 : page;
      let searchToPass = "";

      if (search) {
        searchToPass = search;
      }

      const query = this.getAllCustomerQueryBuilder(
        limitToPass,
        pageToPass,
        searchToPass
      );
      const response = await fetchAPIResponse(query);

      if (!response) {
        throw new CustomError("Error at fetching customers");
      }

      return fmt.formatSuccessResponse("customersResponse", {
        data: response,
      });
    } catch (error) {
      return handleError(error);
    }
  };

  getAllCustomerQueryBuilder(limit, page, search) {
    let body = {
      query: `query getAllCustomers {
        dmsGetCustomers(limit: ${limit}, page: ${page}, search: "${search}") {
          counts {
            all {
              status
              value	
            }
            notOrdered {
              status
              value
            }
            ordered {
              status
              value
            }
          }
          results {
            currentPage
            result {
              created_at
              email
              id
              mobile
              name
              signup_source
            }
            totalCount
            totalPage
          }
        }
      }
      `,
      operationName: "getAllCustomers",
    };
    return body;
  }

  getCustomerDetailsByPhone = async ({ mobile_number }) => {
    try {
      const mobileRegex = /^\+91\d{10}$/;
      if (!mobileRegex.test(mobile_number)) {
        throw new CustomError("Enter valid mobile number in the right format +91 ");
      }

      let body = this.queryBuilder(mobile_number);
      const response = await fetchAPIResponse(body);

      if (
        !response.getOrdersByPhoneNumber.message?.includes(
          "No orders found."
        ) &&
        response.getOrdersByPhoneNumber.message
      ) {
        throw new CustomError(response.getOrdersByPhoneNumber.message);
      }

      const formattedResponse = this.formatApiResponse(
        response.getOrdersByPhoneNumber.message,
        response.getOrdersByPhoneNumber,
        response.getOrdersByPhoneNumber.user
      );

      return fmt.formatSuccessResponse("customerResponse", {
        data: formattedResponse,
      });
    } catch (error) {
      return handleError(error);
    }
  };

  queryBuilder(mobile_number) {
    let body = {
      query: `query getOrdersAndCustomerDetails {
          getOrdersByPhoneNumber(phoneNumber: "${mobile_number}") {
            message
            results {
              result {
                amount
                bank_transaction_id
                city
                color_update_count
                created_at
                id
                order_number
                order_state
                payment_gateway
                payment_method
                pg_response_code
                pg_response_message
                pg_transaction_id
                pincode
                state
                status
                status_message
                user {
                  email
                  mobile
                  name
                  signup_source
                }
                user_id
                vehicle
                updated_at
              }
            }
            user {
              email
              mobile
              name
              signup_source
              userId
            }
          }
        }
        `,
      operationName: "getOrdersAndCustomerDetails",
    };

    return body;
  }

  formatApiResponse(message, response, user) {
    if (user) {
      const responseWithNoOrders = {
        message: message,
        results: null,
        user: user,
      };
      return responseWithNoOrders;
    }

    if (
      !response ||
      !response.results ||
      !response.results.result ||
      response.results.result.length === 0
    ) {
      return null;
    }

    const resultEntry = response.results.result[0];

    if (!resultEntry || !resultEntry.user) {
      return null;
    }

    const formattedResponse = {
      message: message,
      results: {
        user: resultEntry.user,
        result: response.results.result.map((result) => {
          // Exclude the nested user information from each result
          const { user, ...resultWithoutUser } = result;
          return resultWithoutUser;
        }),
      },
    };

    return formattedResponse;
  }

  updateCustomerPayment = async ({ order_id, customer_id, status }) => {
    try {
      console.log(order_id, customer_id, status);
    } catch (error) {
      return handleError(error);
    }
  };

  //locking the customer before allocating
  lockCustomer = async ({ customer_id, order_id, locked_by }) => {
    try {
      if (!locked_by) {
        throw new CustomError("Dealer details needed");
      }
      //check for order
      const order = await prisma.map_customer.findFirst({
        where: {
          order_id: order_id,
        },
      });

      if (order?.status != "locked" && order) {
        throw new CustomError(`Order is ${order.status}`);
      }

      //before locking the customer check in order service if it belongs to the user
      const query = this.checkCustomerOrderQuery(order_id, customer_id, 1);
      const result = await fetchAPIResponse(query);

      if (!result.checkCustomerOrder?.success) {
        throw new CustomError(result.checkCustomerOrder?.message);
      }

      const response = await this.functionLockCustomer(
        customer_id,
        order_id,
        locked_by
      );

      if (response.__typename == "Error") {
        return response;
      }

      return fmt.formatSuccessMutation({
        data_id: customer_id,
        message: response,
      });
    } catch (error) {
      return handleError(error);
    }
  };

  //function for locking the customer for allocating vehicle
  functionLockCustomer = async (customerId, order_id, locked_by) => {
    const lockExpirationTimestamp = new Date(
      Date.now() + timeOfExpiration * 60 * 1000
    );

    const transaction = await prisma.$transaction(async (prisma) => {
      // Start a transaction
      await prisma.$executeRaw`BEGIN;`;

      try {
        //check whether already locked or not
        const userCheck = await prisma.map_customer.findFirst({
          where: {
            user_id: customerId,
            order_id: order_id,
          },
        });

        //check for who has locked
        if (userCheck) {
          if (userCheck?.status == "allocated") {
            throw new CustomError("order already allocated");
          }

          if (userCheck.status == "locked") {
            const expiration = userCheck.lock_expires;
            if (expiration < new Date()) {
              //update or delete
              await prisma.map_customer.deleteMany({
                where: {
                  // user_id: customerId,
                  order_id: order_id,
                  status: "locked",
                },
              });

              return "Lock Expired";
            } else {
              if (userCheck.locked_by == locked_by) {
                return "Proceed to vehicle allocation";
              } else {
                throw new CustomError(`locked by ${userCheck.locked_by}`);
              }
            }
          } else {
            throw new CustomError(`status of customer ${userCheck.status}`);
          }
        }

        //user is not locked
        const id = Helper.generateUuid();

        //create a user entry along with order_id
        await prisma.map_customer.create({
          data: {
            id: id,
            user_id: customerId,
            order_id: order_id,
            created_at: new Date(),
          },
        });

        // Attempt to lock the customer row for the specified duration
        const customerLockResult = await prisma.$executeRaw`
            SELECT * FROM map_customer
            WHERE user_id::uuid = ${customerId}::uuid
            -- AND status = 'ok'
            FOR UPDATE NOWAIT;
          `;

        // Check if the customer row is successfully locked
        if (customerLockResult && customerLockResult.toString().length > 0) {
          // Update the customer status and set the lock expiration timestamp
          await prisma.map_customer.update({
            where: {
              user_id: customerId,
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
          return "customer locked successfully";
        } else {
          // Locking failed (customer row is locked or not found)
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

  //allocating vehicle after locking the customer
  allocateVehicle = async ({
    order_id,
    vehicle_id,
    locked_by,
    vin,
    ordered_vehicle_id,
  }) => {
    try {
      if (ordered_vehicle_id != vehicle_id) {
        throw new CustomError("Color mismatch");
      }

      if (!locked_by) {
        throw new CustomError("Dealer details needed");
      }
      //validation
      if (
        !Helper.validateUuid(order_id) ||
        !Helper.validateUuid(vehicle_id)
        // || vin.length != 17
      ) {
        throw new CustomError("Invalid input");
      }

      if (!vehicle_ids.includes(vehicle_id)) {
        throw new CustomError("Invalid vehicle_id");
      }

      //check for vin
      const vinCheck = await prisma.map_customer.findFirst({
        where: {
          vin: vin,
        },
      });

      if (vinCheck) {
        if (vinCheck.status == "allocated") {
          throw new CustomError("vin already allocated");
        }
      }

      //check in inventory service
      const query = this.vinCheckQuery(vin, vehicle_id);
      const result = await getVehicleList(query);

      if (!result.data.checkVin?.success) {
        throw new CustomError(result.data.checkVin?.message);
      }

      if (!result.data.checkVin?.message.includes("not allocated")) {
        throw new CustomError(result.data.checkVin?.message);
      }

      const response = await this.functionAllocateVehicle(
        order_id,
        vehicle_id,
        locked_by,
        vin
      );

      if (response.__typename == "Error") {
        return response;
      }

      //update the same in dms
      const body = mapCustomer.mutationForStatusUpdate(vin, "allocated");
      const updateStatus = await getVehicleList(body);

      return fmt.formatSuccessMutation({
        data_id: vehicle_id,
        message: response,
      });
    } catch (error) {
      return handleError(error);
    }
  };

  //function allocating vehicle after locking the customer
  functionAllocateVehicle = async (order_id, vehicle_id, locked_by, vin) => {
    try {
      //check if vehicle already locked by someOne
      const vehicle = await prisma.map_customer.findFirst({
        where: {
          // vehicle_id: vehicle_id,
          vin: vin,
          status: "locked",
          locked_by: {
            not: locked_by,
          },
        },
      });

      if (vehicle) {
        throw new CustomError("Vehicle already locked");
      }

      //check if the customer is locked
      const lockedCustomerDetails = await prisma.map_customer.findFirst({
        where: {
          order_id: order_id,
          // vin: vin,
          // status: "locked",
        },
      });

      if (!lockedCustomerDetails) {
        throw new CustomError("Customer not locked");
      }

      if (lockedCustomerDetails.status == "allocated") {
        throw new CustomError("Vehicle already allocated");
      }

      //if customer is locked and not by same user
      if (lockedCustomerDetails.locked_by != locked_by) {
        throw new CustomError(`locked by ${lockedCustomerDetails.locked_by}`);
      }

      const expiration = lockedCustomerDetails.lock_expires;
      if (expiration < new Date()) {
        //delete the customer
        await prisma.map_customer.delete({
          where: {
            order_id: order_id,
            status: "locked",
          },
        });

        return "Lock expired";
      }

      try {
        await prisma.$transaction(async (prisma) => {
          const updateVehicle = await prisma.map_customer.update({
            where: {
              order_id: order_id,
            },
            data: {
              vehicle_id: vehicle_id,
              lock_expires: null,
              locked_by: locked_by,
              status: "allocated",
              vin: vin,
            },
          });
        });
      } catch (error) {
        throw new CustomError("Error while Allocating vehicle");
      }

      return "Vehicle allocated";
    } catch (error) {
      return handleError(error);
    }
  };

  checkCustomerOrderQuery(order_id, user_id, status) {
    console.log(order_id, user_id, status);
    let body = {
      query: `query checkCustomerOrder {
        checkCustomerOrder(order_id: "${order_id}", status: ${status}, user_id: "${user_id}") {
          message
          success
        }
      }
      `,
      operationName: "checkCustomerOrder",
    };
    return body;
  }
  //vin check
  vinCheckQuery(vin, vehicle_id) {
    let body = {
      query: `query CheckVin{
          checkVin(vin: "${vin}", vehicle_id: "${vehicle_id}") {
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
      operationName: "CheckVin",
    };
    return body;
  }

  //change in the color of the order
  changeOrderColor = async ({ vehicle, orderId }) => {
    try {
      // if (!vehicle && !orderId) {
      //   throw new CustomError(`Bad request`);
      // }

      if (!Helper.validateUuid(vehicle) || !Helper.validateUuid(orderId)) {
        throw new CustomError(`Bad request`);
      }

      const query = this.mutationForModifyColor(vehicle, orderId);
      let response = await fetchAPIResponse(query);

      if (!response) {
        throw new CustomError(`Error at updating order: ${orderId}`);
      }

      if (!response.dmsModifyColor?.success) {
        throw new CustomError(response.dmsModifyColor?.message);
      }

      return fmt.formatSuccessMutation({
        data_id: orderId,
        message: response.dmsModifyColor?.message,
      });

    } catch (error) {
      console.log("catching here");
      return handleError(error);
    }
  };

  mutationForModifyColor(vehicle, orderId) {
    let body = {
      query: `mutation modifyOrder{
        dmsModifyColor(orderId : "${orderId}", vehicle : "${vehicle}"){
          message
          success
        }
      }`,
      operationName: "modifyOrder",
    };
    return body;
  }
}

module.exports = () => new customerDetails();
