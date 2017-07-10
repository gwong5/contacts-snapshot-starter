const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../../usersDb')

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
    passwordField: 'password'
  },
  (username, password, done) => {
    User.findUser(username)
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' })
      }
      // if (!user.validPassword(password)) {
      //   return done(null, false, { message: 'Incorrect password.' })
      // }
      console.log(`${user[0].email} logged in`);
      return done(null, user[0])
    })
  })
)

router.post('/sign-in',
  passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/sign_in',
    failureFlash: true })
)

router.post('/sign-up', (request, response) => {
  const { email, password } = request.body
  bcrypt.genSalt(saltRounds, (error, salt) => {
    bcrypt.hash(password, salt, (error, hash) => {
      User.addNewUser(email, hash)
      .then(() => {
        console.log(`${email} added`)
        response.redirect('/')
      })
    })
  })
})

router.get('/sign-out', (request, response) => {
  request.logout()
  response.redirect('/sign_in')
})

module.exports = router
