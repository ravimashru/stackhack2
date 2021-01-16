const express = require('express');
const passport = require('passport');

const authRouter = express.Router();

authRouter.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json(info).status(401).end();
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.status(200).end();
    });
  })(req, res, next);
});

authRouter.post('/api/logout', (req, res) => {
  req.logout();
  res.status(200).end();
});

module.exports = authRouter;
