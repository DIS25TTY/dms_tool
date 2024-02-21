// schema.js
const { gql } = require("apollo-server-express");
const typeDefs = gql`
  type Query {
    health: healthCheckResponse

    getCustomerDetailsByMobile(mobile_number: String): customerDetailsResponse

    getByteBeamData: healthCheckResponse

    getInventoryList(
      id: UUID
      page: Int
      limit: Int
      search: String
    ): inventoryListResponse

    getAllCustomer(
      page: Int
      limit: Int
      search: String
    ): customersDetailsResponse

    getVehicleCount: vehicleCountResponse

    getServiceVersion: versionDetailsResponse
  }

  type versionData {
    data: versionResponse
  }

  type versionResponse {
    serviceName: String
    version: String
  }

  type versionDetails {
    success: Boolean
    data: versionData
  }

  union versionDetailsResponse = versionDetails | Error

  type healthData {
    success: Boolean
    message: String
    uptime: String
  }

  type HealthSuccess {
    data: healthData
    success: Boolean
  }

  type Error {
    success: Boolean
    message: String
    statusCode: String
  }

  interface Response {
    success: Boolean
  }

  type vehicleData {
    vehicle_id: UUID
    model: String
    color: String
    vin: String
    cloud_registered: Boolean
    registration: String
  }

  type inventoryResponse implements Response {
    data: [vehicleData]
    success: Boolean
  }

  type customerResponse {
    data: customerDetails
  }

  type customerDetails {
    message: String
    results: OrdersListForPhonenumber
    user: DetailsOfUser
  }

  type OrdersListForPhonenumber {
    result: [OrderObject]
    user: DetailsOfUser
  }

  type OrderObject {
    id: String
    order_number: String
    vehicle: String
    user_id: String
    pincode: Int
    city: String
    state: String
    amount: Int
    payment_method: String
    payment_gateway: String
    status: Int
    pg_transaction_id: String
    pg_response_code: String
    pg_response_message: String
    order_state: Int
    status_message: String
    color_update_count: Int
    bank_transaction_id: String
    created_at: String
    updated_at: String
  }

  type DetailsOfUser {
    name: String
    email: String
    mobile: String
    signup_source: String
    userId: String
  }

  type getCustomersDetails {
    results: Customers
    counts: UsersStatistics
  }

  type UsersStatistics {
    all: StatusValue
    ordered: StatusValue
    notOrdered: StatusValue
  }

  type StatusValue {
    status: String
    value: String
  }

  type Customers {
    result: [Customer]
    totalCount: Int
    currentPage: Int
    totalPage: Int
  }

  type Customer {
    id: String
    name: String
    mobile: String
    email: String
    created_at: String
    signup_source: String
  }

  type getCustomersData {
    dmsGetCustomers: getCustomersDetails
  }

  type customersResponse {
    data: getCustomersData
    success: Boolean
  }

  type count {
    data: countData
  }

  type countData {
    allocatedCount: Int
    notAllocatedCount: Int
  }

  type getCount {
    getCount: count
    success: Boolean
  }

  type countResponse {
    data: getCount
    success: Boolean
  }

  union healthCheckResponse = HealthSuccess | Error

  union customerDetailsResponse = customerResponse | Error

  union inventoryListResponse = inventoryResponse | Error

  union customersDetailsResponse = customersResponse | Error

  union vehicleCountResponse = countResponse | Error

  #MUTATION DOES HERE
  type Mutation {
    healthCheck: Boolean

    mapVehicleToCustomer(
      vin: String!
      user_id: UUID!
      model: UUID!
      name: String!
      vehicle_registration: String!
      order_id: UUID!
    ): successMutationResponse

    updateCustomerPayment(input: paymentUpdateInput): successMutationResponse

    lockCustomer(
      customer_id: UUID!
      order_id: UUID!
      locked_by: String!
    ): successMutationResponse

    allocateVehicle(
      order_id: UUID!
      vehicle_id: UUID!
      locked_by: String!
      vin: String!
      ordered_vehicle_id: UUID!
    ): successMutationResponse

    lockVehicle(
      vehicle_id: UUID!
      locked_by: String!
      vin: String!
    ): successMutationResponse

    allocateCustomer(
      customer_id: UUID!
      locked_by: String!
      order_id: UUID!
      vin: String!
      allocated_vehicle_id: UUID!
      ordered_vehicle_id: UUID!
    ): successMutationResponse

    cancelAllocation(vin: String, order_id: UUID): successMutationResponse

    changeOrderColor(vehicle: UUID!, orderId: UUID!): successMutationResponse
  }

  input paymentUpdateInput {
    order_id: UUID!
    user_id: UUID!
    status: paymentStatus
  }

  type mapUser {
    message: String
    data: mappedData
  }
  type mappedData {
    vin: String
    user_id: ID
    model: ID
    created_at: String
    updated_at: String
    name: String
    is_verified: Boolean
    vehicle_registration: String
    order_id: ID
    vehicle_cloud_id: ID
  }

  type successResponse {
    success: Boolean
    message: String
    #data_id: UUID
  }

  union successMappingOfVehicle = mapUser | Error

  union successMutationResponse = successResponse | Error

  scalar UUID
  scalar Upload

  enum paymentStatus {
    paid
    not_paid
  }
`;

module.exports = typeDefs;
