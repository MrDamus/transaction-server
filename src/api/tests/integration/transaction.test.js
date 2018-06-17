/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');
const app = require('../../../index');
const User = require('../../models/user.model');
const Transaction = require('../../models/transaction.model')
const JWT_EXPIRATION = require('../../../config/vars').jwtExpirationInterval;

/**
 * root level hooks
 */

async function format(user) {
  const formated = user;

  // delete password
  delete formated.password;

  // get users from database
  const dbUser = (await User.findOne({ email: user.email })).transform();

  // remove null and undefined properties
  return omitBy(dbUser, isNil);
}

describe('Users API', async () => {
  let userAccessToken;
  let dbUsers;
  let user;
  let admin;

  const password = '123456';
  const passwordHashed = await bcrypt.hash(password, 1);

  beforeEach(async () => {
    dbUsers = {
      branStark: {
        email: 'branstark@gmail.com',
        password: passwordHashed,
        name: 'Bran Stark',
        role: 'admin',
        wallet: [],
        transactionsHistory: [],
        money: 1000,
      },
      jonSnow: {
        email: 'jonsnow@gmail.com',
        password: passwordHashed,
        name: 'Jon Snow',
        wallet: [],
        money: 1000,
      },
    };

    user = {
      email: 'sousa.dfs@gmail.com',
      password,
      name: 'Daniel Sousa',
    };

    admin = {
      email: 'sousa.dfs@gmail.com',
      password,
      name: 'Daniel Sousa',
      role: 'admin',
    };

    await User.remove({});
    await User.insertMany([dbUsers.branStark, dbUsers.jonSnow]);
    dbUsers.branStark.password = password;
    dbUsers.jonSnow.password = password;
    userAccessToken = (await User.findAndGenerateToken(dbUsers.branStark)).accessToken;
  });

  describe('POST /v1/transaction/buy/:userId', () => {
    it('should update user with new transaction when user have enough money', async () => {
      delete dbUsers.branStark.password;
      const id = (await User.findOne(dbUsers.branStark))._id;
      const symbol = 'AAPL';
      const amount = 2;
      return request(app)
        .post(`/v1/transaction/buy/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ symbol, amount })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.wallet).to.not.be.undefined;
          expect(res.body.wallet.length).to.be.equal(1);
          expect(res.body.wallet[0].symbol).length.to.be.equal(symbol);
          expect(res.body.wallet[0].amount).length.to.be.equal(amount);
          expect(res.body.money).to.be.lessThan(dbUsers.branStark.money);
        });
    });

    it('should not update user with new transaction when user have doesn\'t enough money', async () => {
      delete dbUsers.branStark.password;
      const id = (await User.findOne(dbUsers.branStark))._id;
      const symbol = 'AAPL';
      const amount = 200;
      return request(app)
        .post(`/v1/transaction/buy/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ symbol, amount })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(dbUsers.branStark.wallet).to.not.be.undefined;
          expect(dbUsers.branStark.wallet.length).to.be.equal(0);
          expect(dbUsers.branStark.money).to.be.equal(dbUsers.branStark.money);
        });
    });
  });
  
  // bad id
  describe('POST /v1/transaction/sell/:userId', () => {
    it('should update user with new amount and transaction history when user have such stock', async () => {
      delete dbUsers.branStark.password;
      const id = (await User.findOne(dbUsers.branStark))._id;
      console.warn(id)
      const symbol = 'AAPL';
      const amount = 2;
      return request(app)
        .post(`/v1/transaction/sell/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ symbol, amount, id: 'test' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(dbUsers.branStark.wallet).to.not.be.undefined;
          expect(dbUsers.branStark.wallet.length).to.be.equal(0);
          expect(dbUsers.branStark.money).to.be.equal(dbUsers.branStark.money);
        });
    });
  });
      // bad amount
});
