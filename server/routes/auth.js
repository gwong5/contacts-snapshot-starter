const express = require('express')
const router = express.Router()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const DbUser = require('../../database/users')
const User = require('../../domain/users')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  DbUser.findById(id)
  .then((user) => {
    return done(null, user)
  })
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (request, email, plainTextPassword, done) => {
    DbUser.findUser(email)
    .then((user) => {
      if (!user) {
        return done(null, false, request.flash('loginError', 'Invalid email or password.'))
      }
      User.validatePassword(plainTextPassword, user.salted_password)
        .then((isValid) => {
          if (!isValid) {
            return done(null, false, request.flash('loginError', 'Invalid email or password.'))
           }
          console.log(`${user.email} signed in`);
          return done(null, user)
      })
    })
  })
)

passport.use(new TwitterStrategy({
    consumerKey: 'GUA8YmjPT7ON2duLKATsIiGCD',
    consumerSecret: 'Ag2uqebCOJedaqIFBSdXiQiKOjYsuGR90cWySteTqUEXRWLXwm',
    userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
    callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate(profile.emails[0].value, tokenSecret)
    .then((user) => {
      console.log(`${user.email} has signed in`)
      done(null, user)
    })
  }
))

router.get('/auth/twitter',
  passport.authenticate('twitter')
)

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/home',
    failureRedirect: '/sign_in'})
)

router.post('/sign-in',
  passport.authenticate('local', { successRedirect: '/home',
    failureRedirect: '/sign_in',
    failureFlash: true })
)

router.post('/sign-up', (request, response) => {
  const { email, password } = request.body
  DbUser.findUser(email)
  .then((user) => {
    if (user) {
      request.flash('creationError', 'User already exists.')
      response.redirect('/sign_up')
    } else {
      User.addNewUser(email, password)
      .then(() => {
        console.log(`account created for: ${email}`)
        passport.authenticate('local')
        (request, response, () => {
          response.redirect('/home')
        })
      })
    }
  })
})

module.exports = router
