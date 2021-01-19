const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const { localStrategy, isAuthenticated } = require('./authentication');

const userRouter = require('./routers/user');
const authRouter = require('./routers/auth');

const userVerifyController = require('./routers/user-verify');

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

// The verification endpoint is not included in the userRouter
// because the endpoint should be accessible to unauthenticated users
app.post('/api/users/:userId/verify', userVerifyController.verifyUser);
app.use(isAuthenticated, userRouter);

module.exports = app;
