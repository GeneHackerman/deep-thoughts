const express = require('express');
// import ApolloServer
const { ApolloServer } = require('apollo-server-express');
const { authMiddleWare } = require('./utils/auth');

// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleWare
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });
}

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});

// call the async function to start the server
startApolloServer(typeDefs, resolvers);
