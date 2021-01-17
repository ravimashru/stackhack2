const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const { localStrategy, isAuthenticated } = require('./authentication');

const userRouter = require('./controllers/user');
const authRouter = require('./controllers/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    key: 'mykey',
    secret: 'mysecret',
    saveUninitialized: true,
    resave: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(localStrategy);

app.use(authRouter);
app.use(isAuthenticated, userRouter);

module.exports = app;
