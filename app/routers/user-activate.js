const { getUserModel } = require('../../database');

const activate = async (req, res) => {
  const User = getUserModel();
  const { username, password } = req.body;
  const employeeObjectId = req.params.id;

  // username and password are mandatory
  if (!username || !password) {
    return res.status(400).end();
  }

  // Do not activate already activated user
  let existingUser = await User.findOne({ employeeId: employeeObjectId }).exec();
  if (existingUser) {
    return res.status(403).json({
      message: `This employee's user has already been activated.`
    });
  }

  // Do not activate user if username is already taken
  const usersWithSameUsername = await User.find({ username }).exec();
  if (usersWithSameUsername.length > 0) {
    return res.status(409).json({
      message: `The username '${username}' is already taken. Please use a different username.`,
    });
  }

  const user = new User({
    username,
    passwordHash: password,
    employeeId: employeeObjectId,
  });
  await user.save();

  user.set('passwordHash', undefined);

  return res.status(200).json(user);
};

module.exports = {
  activate,
};
