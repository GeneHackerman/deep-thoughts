import React from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import NoMatch from './pages/NoMatch';
import SingleThought from './pages/SingleThought';
import Profile from './pages/Profile';
import Signup from './pages/Signup';

const httpLink = createHttpLink({
  uri: '/graphql',
});

// not using first parameter, but using underscore(placeholder) to access the second that we need
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
    <div className='flex-column justify-flex-start min-100-vh'>
      <Header />
      <div className='container'>
       {/*content within Routes will change according to URL route*/}
       {/*each route will be a new page upon click*/}
        <Routes>
          <Route 
            path="/"
            element={<Home />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route 
            path="/signup"
            element={<Signup />}
          />
          <Route 
            path="/profile/:username?"
            element={<Profile />}
          />
          <Route
            path="/thought/:id"
            element={<SingleThought />}
          />

          <Route 
            path="*"
            element={<NoMatch />}
          />
        </Routes>
      </div>
      <Footer />
    </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
