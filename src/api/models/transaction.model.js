const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

/**
 * Transaction Schema
 * @private
 */
const transactionSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
transactionSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'symbol', 'amount', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
transactionSchema.statics = {

  /**
   * Get transaction
   *
   * @param {ObjectId} id - The objectId of transaction.
   * @returns {Promise<Transaction, APIError>}
   */
  async get(id) {
    try {
      let transaction;

      if (mongoose.Types.ObjectId.isValid(id)) {
        transaction = await this.findById(id).exec();
      }
      if (transaction) {
        return transaction;
      }

      throw new APIError({
        message: 'Transaction does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List transactions in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of transactions to be skipped.
   * @param {number} limit - Limit number of transactions to be returned.
   * @returns {Promise<Transaction[]>}
   */
  list({
    page = 1, perPage = 30, name, email, role,
  }) {
    const options = omitBy({ name, email, role }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef Transaction
 */
module.exports = mongoose.model('Transaction', transactionSchema);
