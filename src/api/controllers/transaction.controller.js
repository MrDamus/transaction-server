const Transaction = require('../models/transaction.model');
const SoldStock = require('../models/soldStock.model');
const { handler: errorHandler } = require('../middlewares/error');
const axios = require('axios');


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
  const { user } = req.locals;
  const { symbol, amount } = req.body;
  const url = `https://api.iextrading.com/1.0/stock/${symbol}/price`;
  const resp = await axios.get(url);
  const price = resp.data;
  const cost = price * amount;
  if (cost > user.money) {
    res.status(400).json({ error: 'Not enough money' });
    return;
  }
  const newTransaction = Object.assign(req.body, { price });
  const transaction = await (new Transaction(newTransaction)).save();
  const money = user.money - cost;
  console.log(money);
  const { wallet } = req.locals.user;
  wallet.push(transaction);
  const updatedUser = Object.assign(user, { wallet, money });

  updatedUser.save()
    .then(savedUser => res.json(savedUser.transform()))
    .catch(e => console.warn(e));
};

exports.sell = async (req, res, next) => {
  const { user } = req.locals;
  const { symbol, amount, id } = req.body;
  const url = `https://api.iextrading.com/1.0/stock/${symbol}/price`;
  const resp = await axios.get(url);
  const price = resp.data;
  const income = price * amount;
  const userHaveRequestedAmount = amount < user.wallet.find(t => t._id === id).amount;
  if (!userHaveRequestedAmount) {
    res.status(400).json({ error: 'You do not have such stock' });
    return;
  }
  // TODO: delete stock from wallet 
  const newTransactionHistory = Object.assign(req.body, { price });
  const transactionHistory = await (new SoldStock(newTransactionHistory)).save();
  const money = user.money + income;
  console.log(money);
  const { wallet } = req.locals.user;
  const { transactionsHistory } = req.locals.user;
  transactionsHistory.push(transactionHistory);
  const updatedUser = Object.assign(user, { wallet, transactionsHistory, money });

  updatedUser.save()
    .then(savedUser => res.json(savedUser.transform()))
    .catch(e => console.warn(e));
};
