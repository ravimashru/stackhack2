const express = require('express');

const userRouter = express.Router();

const { getUserModel } = require('../../database');

userRouter.get('/api/users', async (req, res) => {
  const User = getUserModel();
  const users = await User.find();
  return res.json({ users }).status(200);
});

userRouter.get('/api/users/:userId', async (req, res) => {
  const User = getUserModel();
  const user = await User.findById(req.params.userId);
  return res.json(user).status(200);
});

userRouter.post('/api/users', async (req, res) => {
  const User = getUserModel();
  const userDetails = req.body;
  userDetails.userActivated = false;
  const user = await User.create(userDetails);
  res.json(user);
});

module.exports = userRouter;
