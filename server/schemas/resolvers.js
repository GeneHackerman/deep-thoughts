const { AuthenticationError } = require('apollo-server-express');
const { User, Thought } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // parent is placeholder to pass through 2nd param username argument
        // if username exists, returns object if not, then empty
        // object is then passed through find() method. if data, looks up specific username
        // if no data, returns all thoughts
// 21.2.5 me does not test properly on apollo*****
        me: async(parent, args) => {
            if (context.user) {
            const userData = await User.findOne({ _id: context.user._id })
                .select('-__V -password')
                .populate('thoughts')
                .populate('friends');

            return userData;
        }
        throw new AuthenticationError('Not logged in');
        },

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
               .populate('thoughts')
        },
        
        thoughts: async (parent, { username }) => {
            // performs find() method on Thought in sorted order
            const params = username ? { username } : {};
            return Thought.find(params).sort({ createAt: -1 });
        },

        thought: async(parent, { _id }) => {
            return Thought.findOne({ _id });
        }, 

    },

    // mutation will allow for changes to be made
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };

        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError(`Incorrect credentials`);
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError(`Incorrect credentials`);
            }

            const token = signToken(user);
            return { token, user };
        },
        addThought: async (parent, args, context) => {
            if (context.user) {
                const thought = await Thought.create({ ...args, username: context.user.username });

                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { thoughts: thought._id } },
                    { new: true }
                );

                return thought;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if (context.user) {
                const updatedThought = await Thought.findOneAndUpdate(
                    { _id: thoughtId },
                    { $push: { reactions: { reactionBody, username: context.user.username } } },
                    { new: true, runValidators: true }
                );

                return updatedThought;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { friends: friendId } },
                    { new: true }
                ).populate('friends');

                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;