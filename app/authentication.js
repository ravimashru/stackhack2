const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { getUserModel } = require('../database');

const localStrategy = new LocalStrategy(async (username, password, done) => {
  let user;
  if (process.env.NODE_ENV === 'test' && username === 'test') {
    user = { username, password };
  } else {
    const User = getUserModel();
    // TODO: check for hashed password
    user = await User.findOne({ username, passwordHash: password }).exec();
  }
  if (!user) {
    return done(null, false, { message: 'Login failed' });
  }
  return done(null, user);
});

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  let user;
  if (process.env.NODE_ENV === 'test' && username === 'test') {
    user = { username };
  }
  if (!user) {
    done(null, false);
  }
  done(null, user);
});

const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).end();
  }
  next();
}

module.exports = {
  localStrategy,
  isAuthenticated,
};
