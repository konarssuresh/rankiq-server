'use strict';

const { validationResult } = require('express-validator');
const JWT = require('jsonwebtoken');
require('dotenv').config();
const { getDb } = require('../utils/mongoUtils');

const cryptoUtils = require('../utils/cryptoUtils');

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map(({ msg }) => msg) });
  }
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const { email, password, firstName, lastName } = req.body;
    const userObj = {
      email,
      firstName,
      lastName,
      password: cryptoUtils.encrypt(password),
      status: 'Not Verified',
    };
    await usersCollection.insertOne(userObj);

    res.status(200).json({ message: 'User added successfully' });
  } catch (e) {
    next();
  }
};

const signIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map(({ msg }) => msg) });
  }
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email });
    if (!user) {
      res.status(404).send({ message: 'User Not found.' });
    }
    const dbPassword = cryptoUtils.decrypt(user.password);
    const isPasswordInvalid = dbPassword !== password;
    if (isPasswordInvalid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Invalid Password!',
      });
    }

    const accessToken = await JWT.sign(
      { email: user.email, status: user.status },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 86400 } // 24 hrs
    );

    res.status(200).send({
      email: user.email,
      status: user.status,
      accessToken,
    });
  } catch (e) {
    next();
  }
};

module.exports = { signUp, signIn };
