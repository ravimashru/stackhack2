const express = require('express');

const userRouter = express.Router();

const { getUserModel } = require('../../database');

userRouter.get('/api/users', async (req, res) => {
  const User = getUserModel();
  const users = await User.find();
  return res.json({ users }).status(200);
});

userRouter.post('/api/users', async (req, res) => {
  const User = getUserModel();
  const user = await User.create(req.body);
  res.json(user);
});

module.exports = userRouter;
