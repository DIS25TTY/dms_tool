const createApolloServer = require("./graphqlServer");

const server = createApolloServer();

const graphqlServerApp = async (app) => {
  await server.start();
  server.applyMiddleware({ app, path: "/api/graphql"});
};

module.exports = { graphqlServerApp };
