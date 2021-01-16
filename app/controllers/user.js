const express = require('express');

const userRouter = express.Router();

userRouter.get('/api/users', (req, res) => {
  return res.json({ users: [] }).status(200);
});

module.exports = userRouter;
