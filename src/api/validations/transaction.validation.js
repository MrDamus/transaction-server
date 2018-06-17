const Joi = require('joi');

module.exports = {
  // POST /v1/users
  buy: {
    body:
    {
      symbol: Joi.string().required(),
      amount: Joi.number().integer().min(1).required(),
    },
  },
  sell: {
    body:
    {
      id: Joi.string().required(),
      symbol: Joi.string().required(),
      amount: Joi.number().integer().min(1).required(),
    },
  },
};
