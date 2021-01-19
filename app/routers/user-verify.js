const { getUserModel } = require('../../database');

const verifyUser = async (req, res) => {
  const User = getUserModel();
  const { username, password } = req.body;
  const userId = req.params.userId;

  // Do not verify user if username is already taken
  const usersWithSameUsername = await User.find({ username }).exec();
  if (usersWithSameUsername.length > 0) {
    return res.status(400).end();
  }

  let user = await User.findById(userId).exec();
  if (user) {
    user.username = username;
    // TODO: hash password and store
    user.passwordHash = password;
    user = await user.save();
    user.passwordHash = undefined;
    res.json(user).end();
  } else {
    res.status(404).end();
  }
};

module.exports = {
  verifyUser,
};
