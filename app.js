var createError = require('http-errors');
var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
var GoogleStrategy = require('passport-google-oauth20');
// Import Facebook and Google OAuth apps configs
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var locationsRouter = require('./routes/locations');
var settingsRouter = require('./routes/settings');
var app = express();
const facebook = {
  clientID: '963549583810977',
  clientSecret: '93d5f801bea47ec39532914b578d025a',
  callbackURL: 'https://e53e164f.ngrok.io/auth/facebook/callback',
  profileFields: ['id', 'name', 'displayName', 'picture', 'email'],
};
const google = {
  clientID: '568404380953-qc6esd5drvc5n07j49chi52h7fs72p4t.apps.googleusercontent.com',
  clientSecret: 'QGHAmyqYkrYjJWq4Tn2vd3Ts',
  callbackURL: 'https://e53e164f.ngrok.io/auth/google/callback',
};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
// and we want to transform them into user objects that have the same set of attributes
const transformFacebookProfile = (profile) => ({
  name: profile.name,
  avatar: profile.picture.data.url,
});

// Transform Google profile into user object
const transformGoogleProfile = (profile) => ({
  name: profile.displayName,
  avatar: profile.image.url,
});

// Register Facebook Passport strategy
passport.use(new FacebookStrategy(facebook,
  // Gets called when user authorizes access to their profile
  async function(accessToken, refreshToken, profile, done){
    done(null, transformFacebookProfile(profile._json))
}
));

// Register Google Passport strategy
passport.use(new GoogleStrategy(google,
  async function(accessToken, refreshToken, profile, done){
    done(null, transformGoogleProfile(profile._json))
}
));

// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));
// Initialize Passport
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/locations', locationsRouter);
app.use('/settings', settingsRouter);
// Set up Facebook auth routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
  // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
  (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));

// Set up Google auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
