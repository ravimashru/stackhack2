const express = require('express');

const userRouter = express.Router();

const { getUserModel } = require('../../database');

userRouter.get('/api/users', async (req, res) => {
  const User = getUserModel();
  const users = await User.find();
  return res
    .json({ users: users.map((e) => delete e.passwordHash) })
    .status(200);
});

userRouter.get('/api/users/:userId', async (req, res) => {
  const User = getUserModel();
  const user = await User.findById(req.params.userId);
  delete user.passwordHash;
  return res.json(user).status(200);
});

userRouter.post('/api/users', async (req, res) => {
  const User = getUserModel();
  const userDetails = req.body;

  // Newly created user should not have:
  //  1. username
  //  2. passwordHash
  //  3. userActivated
  delete userDetails.username;
  delete userDetails.passwordHash;
  userDetails.userActivated = false;

  try {
    const user = await User.create(userDetails);
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
});

module.exports = userRouter;
