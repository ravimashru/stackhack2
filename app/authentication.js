const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  if (process.env.NODE_ENV === 'test') {
    user = { username, password };
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
  if (process.env.NODE_ENV === 'test') {
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
