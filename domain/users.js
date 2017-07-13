const bcrypt = require('bcrypt')
const DbUser = require('../database/users')

const salt = bcrypt.genSaltSync(10)
const makeSaltedPassword = (plainTextPassword) => 
  bcrypt.hashSync(plainTextPassword, salt)

const validatePassword = (plainTextPassword, saltedPassword) => {
  return bcrypt.compare(plainTextPassword, saltedPassword)
}

const addNewUser = (email, password) => {
  const saltedPassword = makeSaltedPassword(password)
  return DbUser.addNewUser(email, saltedPassword)
}

const findOrCreate = (email, tokenSecret) => {
  return DbUser.findUser(email)
  .then((user) => {
    if (!user) {
      return DbUser.addNewUser(email, tokenSecret)
    }
    return user
  })
}

module.exports = {makeSaltedPassword, validatePassword, addNewUser}
