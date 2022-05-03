const { User, Thought } = require('../models');

const resolvers = {
    Query: {
        // parent is placeholder to pass through 2nd param username argument
        // if username exists, returns object if not, then empty
        // object is then passed through find() method. if data, looks up specific username
        // if no data, returns all thoughts
        // get all users
        users: async() => {
            return User.find()
               .select('-__V -password')
               .populate('friends')
               .populate('thoughts');
        },
        // get a user by username
        user: async (parent, { username }) => {
            return User.findOne({ username })
               .select('-__V -password')
               .populate('friends')
               .populate('thoughts');
        },
        
        thoughts: async (parent, { username }) => {
            // performs find() method on Thought in sorted order
            const params = username ? { username } : {};
            return Thought.find(params).sort({ createAt: -1 });
        },

        thought: async(parent, { _id }) => {
            return Thought.findOne({ _id });
        }
    }
};

module.exports = resolvers;