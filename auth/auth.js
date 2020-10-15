const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const controller = require('./../mongo/controller');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const validator = require("validator");

passport.use('login', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    async (username, password, done) => {
        if (validator.isEmpty(username)) {
            return done(null, false, {message: "Empty username"})
        } else if (!validator.matches(username, '^[a-zA-Z0-9_.-]*$')) {
            return done(null, false, {message: "Invalid username"})

        }

        if (validator.isEmpty(password)) {
            return done(null, false, {message: "Empty password"})
        }

        try {
            const [user, validate] = await controller.validatePassword(username, password)

            if (!user) {
                return done(null, false, {message: "No account exists with those credentials"});
            } else if (!validate) {
                return done(null, false, {message: "The password you entered is incorrect"});
            } else {
                return done(null, user, {message: "Successfully logged in"});
            }

        } catch (err) {
            return done(err);
        }
    })
);

passport.use(
    new JWTstrategy(
        {
            secretOrKey: 'TOP_SECRET',
            jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
        },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (error) {
                done(error);
            }
        }
    )
);
