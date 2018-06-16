const Joi = require('joi');
const User = require('../models/user.model');

module.exports = {
  // POST /v1/users
  buy: {
    body:
    {
      symbol: Joi.string().required(),
      amount: Joi.number().integer().min(1).required(),
    },
  },
};
