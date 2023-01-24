const { readFileSync } = require("fs");
const { join } = require("path");
const { createServer } = require("http");
const { ApolloServer } = require("apollo-server-express");
const { execute, subscribe } = require("graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const express = require("express");

const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const Subscription = require("./resolvers/Subscription");
const User = require("./resolvers/User");
const Post = require("./resolvers/Post");

const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Post,
};

/**
 * Start ApolloServer using `apollo-server-express` in order to enable
 * subscriptions and allow us to provide define our own express middleware
 *
 * @see https://www.apollographql.com/docs/apollo-server/integrations/middleware/#swapping-out-apollo-server
 */
async function startApolloServer() {
  const app = express();
  const httpServer = createServer(app);
  const graphqlPath = "/";

  const schema = makeExecutableSchema({
    typeDefs: readFileSync(join(__dirname, "schema.graphql"), "utf8"),
    resolvers,
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: graphqlPath,
    }
  );

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => {
      return {
        req,
      };
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    path: graphqlPath,
  });

  const port = 4000;
  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `Server is running on http://localhost:${port}${apolloServer.graphqlPath}`
  );
}

startApolloServer();
