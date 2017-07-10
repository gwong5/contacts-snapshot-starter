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
    passwordField: 'password'
  },
  (username, password, done) => {
    User.findUser(username)
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' })
      }
      bcrypt.compare(password, user[0].password).then((result) => {
        if (!result) {
          return done(null, false, { message: 'Incorrect password.'})
        }
        console.log(`${user[0].email} logged in`);
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
  const hashedPassword = hash(password)
  User.addNewUser(email, hashedPassword)
  .then(() => {
    console.log(`${email} added`)
    response.redirect('/')
  })
})

module.exports = router
