const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const create_connection = require('./../mongo/create_connection');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const validator = require("validator");

const emptyUsernameError = [400, "Empty username"];
const emptyPasswordError = [400, "Empty password"];
const accountNotFoundError = [404, "No account exists with those credentials"];
const wrongPasswordError = [400, "The password you entered is incorrect"];
const loginSuccess = [200, "Successfully logged in"];

passport.use('login', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    async (username, password, done) => {
        if (validator.isEmpty(username)) {
            return done(null, false, emptyUsernameError)
        }
        if (validator.isEmpty(password)) {
            return done(null, false, emptyPasswordError)
        }

        try {
            const [user, validate] = await create_connection.validatePassword(username, password)

            if (!user) {
                return done(null, false, accountNotFoundError);
            } else if (!validate) {
                return done(null, false, wrongPasswordError);
            } else {
                return done(null, user, loginSuccess);
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
            //each extractor is attempted in order until one returns a token, header is the preferred approach
            jwtFromRequest: ExtractJWT.fromExtractors([ExtractJWT.fromHeader("secret_token"),
                ExtractJWT.fromAuthHeaderAsBearerToken(),
                ExtractJWT.fromUrlQueryParameter("secret_token")])
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
