const pgp = require('pg-promise')()
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/contacts'
const db = pgp(connectionString)

const createContact = function(contact){
  return db.query(`
    INSERT INTO
      contacts (first_name, last_name)
    VALUES
      ($1::text, $2::text)
    RETURNING
      *
    `,
    [
      contact.first_name,
      contact.last_name,
    ])
    .then(data => data)
    .catch(error => error);
}

const getContacts = function(){
  return db.query(`
    SELECT
      *
    FROM
      contacts
    `, [])
    .then(data => data)
    .catch(error => error);
}

const getContact = function(contactId){
  return db.one(`
    SELECT * FROM contacts WHERE id=$1::int LIMIT 1
    `,
    [contactId])
    .then(data => data)
    .catch(error => error);
}

const deleteContact = function(contactId){
  return db.query(`
    DELETE FROM
      contacts
    WHERE
      id=$1::int
    `,
    [contactId])
    .then(data => data)
    .catch(error => error);
}

const searchForContact = function(searchQuery){
  return db.query(`
    SELECT
      *
    FROM
      contacts
    WHERE
      lower(first_name || ' ' || last_name) LIKE $1::text
    `,
    [`%${searchQuery.toLowerCase().replace(/\s+/,'%')}%`])
    .then(data => data)
    .catch(error => error);
}

module.exports = {
  createContact,
  getContacts,
  getContact,
  deleteContact,
  searchForContact,
}
