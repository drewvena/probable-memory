const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('books')
          
              return userData;
            }
          
            throw new AuthenticationError('Log in unsuccessful');
          },
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
          
            return { token, user };
          },
          login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
          
            if (!user) {
              throw new AuthenticationError('Incorrect username/password');
            }
          
            const correctPw = await user.isCorrectPassword(password);
          
            if (!correctPw) {
              throw new AuthenticationError('Incorrect username/password');
            }
          
            const token = signToken(user);
            return { token, user };
          },
          saveBook: async (parent, args, context) => {
            if (context.user) {
              const updated = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: args.input } },
                { new: true }
              );
          
              return updated;
            }
          
            throw new AuthenticationError('Must be logged in!');
          },
          removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
              const updated = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
              );
          
              return updated;
            }
          
            throw new AuthenticationError('Must be logged in!');
          },
      }
  };
  
  module.exports = resolvers;