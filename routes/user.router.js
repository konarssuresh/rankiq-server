'use strict';

const express = require('express');
const { body, check } = require('express-validator');
const userRouter = express.Router();
const checkDuplicateUser = require('../middlewares/checkDuplicateUser');
const { REGEX } = require('../constants/global');
const controller = require('../controllers/user.controller');

userRouter.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Enter valid email'),
    body('firstName').not().isEmpty().withMessage('firstName is required'),
    check('password')
      .matches(REGEX.PASSWORD)
      .withMessage(
        'Passowrd must contain combination of numbers,alphabets and special chars along with Capital letter'
      ),
    checkDuplicateUser,
  ],
  controller.signUp
);

userRouter.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Enter valid email'),
    body('password').not().isEmpty().withMessage('firstName is required'),
  ],
  controller.signIn
);

module.exports = userRouter;
