const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const { localStrategy, isAuthenticated } = require('./authentication');

const employeeRouter = require('./routers/employee');
const authRouter = require('./routers/auth');

const userActivateRouter = require('./routers/user-activate');
const loggedInUserRouter = require('./routers/logged-in-user');

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

// The :id is the ObjectId of the Employee document
app.post('/api/verify/:id', userActivateRouter.activate);
app.use('/api/employees', isAuthenticated, employeeRouter);

app.use('/api/me', isAuthenticated, loggedInUserRouter);

module.exports = app;
