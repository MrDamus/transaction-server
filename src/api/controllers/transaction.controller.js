const Transaction = require('../models/transaction.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};


/**
 * BUY stock
 * @public
 */

exports.buy = async (req, res, next) => {
  const transaction = await (new Transaction(req.body)).save();
  const { wallet } = req.locals.user;
  wallet.push(transaction);
  const user = Object.assign(req.locals.user, { wallet });

  user.save()
    .then(savedUser => res.json(savedUser.transform()))
    .catch(e => console.warn(e));
};
