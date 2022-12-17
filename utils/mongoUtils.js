'use strict';

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

let db;

module.exports = {
  connectToServer: (callback) => {
    MongoClient.connect(
      process.env.MONGODB,
      { useNewUrlParser: true },
      (err, client) => {
        db = client.db('RankIQ');
        return callback(err);
      }
    );
  },

  getDb: () => {
    return db;
  },
};
