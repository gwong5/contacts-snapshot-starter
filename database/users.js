const pgp = require('pg-promise')()
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/contacts'
const db = pgp(connectionString)

const users = {}

users.addNewUser = (email, saltedPassword) => {
  return db.query(`
    INSERT INTO 
      users (email, salted_password)
    VALUES
      ($1, $2)
  `,
  [
    email,
    saltedPassword
  ])
  
  .catch(error => error)
}

users.findUser = (email) => {
  return db.query(`
    SELECT
      *
    FROM
      users
    WHERE
      email = $1
  `,
  [
    email
  ])
  .then(user => user[0])
  .catch(error => error)
}

users.findById = (id) => {
  return db.query(`
    SELECT
      *
    FROM
      users
    WHERE
      id = $1
  `,
  [
    id
  ])
  .then(user => user[0])
  .catch(error => error)
}

module.exports = users
