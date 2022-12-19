'use strict';

const { validationResult } = require('express-validator');
const JWT = require('jsonwebtoken');
require('dotenv').config();
const { getDb } = require('../utils/mongoUtils');
const nodeMailer = require('../utils/emailUtils');
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
    const token = JWT.sign({ email }, process.env.ACCESS_TOKEN_SECRET);
    const userObj = {
      email,
      firstName,
      lastName,
      password: cryptoUtils.encrypt(password),
      status: 'Pending',
      confirmationCode: token,
    };
    await usersCollection.insertOne(userObj);

    res.status(200).json({ message: 'User added successfully' });

    nodeMailer.sendConfirmationEmail(
      userObj.firstName,
      userObj.email,
      userObj.confirmationCode
    );
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

    if (user.status !== 'Active') {
      return res.status(401).send({
        message: 'Pending Account. Please Verify Your Email!',
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
      firstName: user.firstName,
      accessToken,
    });
  } catch (e) {
    next();
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({
      confirmationCode: req.params.confirmationCode,
    });

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    const updateDocument = {
      $set: {
        status: 'Active',
      },
    };
    const result = await usersCollection.updateOne(
      { email: user.email },
      updateDocument
    );

    if (result.modifiedCount === 1) {
      res.status(200).send({
        message: 'Thanks for verifying your account',
      });
    } else {
      res
        .status(500)
        .send({ message: 'Error Activating your account. Please try again' });
      return;
    }
  } catch (e) {
    next();
  }
};

module.exports = { signUp, signIn, verifyUser };
