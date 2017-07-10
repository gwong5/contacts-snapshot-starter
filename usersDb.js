const pgp = require('pg-promise')()
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/contacts'
const db = pgp(connectionString)

const users = {}

users.addNewUser = (email, password) => {
  return db.query(`
    INSERT INTO 
      users (email, password)
    VALUES
      ($1, $2)
  `,
  [
    email,
    password
  ])
  .catch((error) => error)
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
  .then((data) => data)
  .catch((error) => error)
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
  .then((user) => user)
  .catch((error) => error)
}

users.validatePassword = (email, password) => {
  console.log('validating')
  return db.query(`
    SELECT 
      * 
    FROM 
      users 
    WHERE 
      email = $1 AND password = $2
  `, [
    email, 
    password
  ])
  .then(user => user)
  .catch(data => data)
}

module.exports = users
