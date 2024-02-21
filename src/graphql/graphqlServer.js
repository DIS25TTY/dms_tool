// graphqlServer.js
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema/schema");
const queryResolvers = require("./resolvers/queries");
const mutationResolvers = require("./resolvers/mutation");
const { logger } = require("../utils/logger");
const { GraphQLError } = require("graphql");
const { GraphQLUpload } = require('graphql-upload-minimal');

const createApolloServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers: [queryResolvers, mutationResolvers],
    context: ({ req, res }) => {
      // return { logger: logger.info({ req: req }) };
      logger.info({ req: req });
      if (res.statusCode == 200) {
        logger.info({ res: "Request Ends" });
      } else {
        logger.info({ res: "Request failed" });
      }
    },
    formatError: (error) => {
      console.log(JSON.stringify(error));
      if (error.extensions?.code == "GRAPHQL_VALIDATION_FAILED") {
        throw new GraphQLError("INTERNAL SERVER ERROR", {
          extensions: {
            code: "500",
            // exception : {
            //   stacktrace : "false"
            // }
          },
        });
      }
      if (error.extensions?.code) {
        throw new GraphQLError("BAD REQUEST", {
          extensions: {
            code: "400",
            exception : {
              stacktrace : "false"
            }
          },
        });
      }
    },
    debug: true,
    // introspection : false,
    // playground : false,
  });
};

module.exports = createApolloServer;
