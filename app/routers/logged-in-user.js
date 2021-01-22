const express = require('express');

const loggedInUserRouter = express.Router();

loggedInUserRouter.get('/', (req, res) => {
  return res.status(200).end();
});

module.exports = loggedInUserRouter;
