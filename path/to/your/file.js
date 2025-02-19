const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

// ...existing code...

passport.use(new LocalStrategy(User.authenticate()));

// ...existing code...
