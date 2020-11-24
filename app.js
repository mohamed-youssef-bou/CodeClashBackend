var createError = require("http-errors");
var express = require('express');
var path = require('path');
var cors = require("cors");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var challengeRouter = require('./routes/challenge');
var testRouter = require("./routes/testFrontend");
var secureRouter = require("./routes/secure-routes")
var submissionRouter = require("./routes/submission")

var app = express();

require('./auth/auth');

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add all end points here
app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', challengeRouter);
app.use('/', submissionRouter);
app.use("/test", testRouter);

// Plug in the JWT strategy as a middleware so only verified users can access this route.
//Example:
app.use('/profile', passport.authenticate('jwt', { session: false }), secureRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});



module.exports = app;




