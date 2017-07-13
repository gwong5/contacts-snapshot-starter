const express = require('express')
const database = require('../../database/database')
const {renderError} = require('../utils')

const router = express.Router()

router.get('/new', (request, response) => {
  response.render('new')
})

router.post('/', (request, response) => {
  database.createContact(request.body)
    .then(function(contact) {
      if (contact) return response.redirect(`/contacts/${contact.id}`)
      next()
    })
    .catch( error => renderError(error, response, response) )
})

router.get('/:contactId', (request, response, next) => {
  const contactId = request.params.contactId
  if (!contactId || !/^\d+$/.test(contactId)) return next()
  database.getContact(contactId)
    .then(function(contact) {
      if (contact) return response.render('show', { contact })
      next()
    })
    .catch( error => renderError(error, response, response) )
})


router.get('/:contactId/delete', (request, response) => {
  const contactId = request.params.contactId
  database.deleteContact(contactId)
    .then(function(contact) {
      if (contact) return response.redirect('/')
      next()
    })
    .catch( error => renderError(error, response, response) )
})

router.get('/search', (request, response) => {
  const query = request.query.q
  database.searchForContact(query)
    .then(function(contacts) {
      if (contacts) return response.render('index', { query, contacts })
      next()
    })
    .catch( error => renderError(error, response, response) )
})

module.exports = router
