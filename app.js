'use strict';

const mongoUtil = require('./utils/mongoUtils.js');
const dotenv = require('dotenv');
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3000;
const cors = require('cors');
const express = require('express');
const userRouter = require('./routes/user.router');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', userRouter);
app.get('/', (req, res) => {
  res.send('hello world');
});

mongoUtil.connectToServer((err) => {
  if (err) console.log(err);
  app.listen(port, () => {
    console.log('app listening on port ' + port);
  });
});