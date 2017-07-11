const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../../usersDb')

const salt = bcrypt.genSaltSync(10)
const hash = (plainTextPassword) => bcrypt.hashSync(plainTextPassword, salt)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id)
  .then((user) => {
    return done(null, user)
  })
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (request, username, password, done) => {
    User.findUser(username)
    .then((user) => {
      if (!user[0]) {
        return done(null, false, request.flash('loginError', 'Invalid username or password.'))
      }
      bcrypt.compare(password, user[0].password).then((result) => {
        if (!result) {
          return done(null, false, request.flash('loginError', 'Invalid username or password.'))
        }
        console.log(`${user[0].email} signed in`);
        return done(null, user[0])
      })
    })
  })
)

router.post('/sign-in',
  passport.authenticate('local', { successRedirect: '/home',
    failureRedirect: '/sign_in',
    failureFlash: true })
)

router.post('/sign-up', (request, response) => {
  const { email, password } = request.body
  User.findUser(email)
  .then((user, done) => {
    if (user[0]) {
      request.flash('creationError', 'User already exists.')
      response.redirect('/sign_up')
    } else {
      const hashedPassword = hash(password)
      User.addNewUser(email, hashedPassword)
      .then(() => {
        console.log(`account created for: ${email}`)
        response.redirect('/')
      })
    }
  })
})

module.exports = router
