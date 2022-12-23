'use strict';

const express = require('express');
const contentRouter = express.Router();
const controller = require('../controllers/content.controller');

contentRouter.get('/getContent', controller.getContent);

module.exports = contentRouter;
