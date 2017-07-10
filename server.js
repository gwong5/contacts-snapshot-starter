const express = require('express')
const bodyParser = require('body-parser')
const database = require('./database')
const session = require('express-session')
const app = express()
const {renderError} = require('./server/utils')
const contacts = require('./server/routes/contacts')
const users = require('./server/routes/auth')
const passport = require('passport')

app.set('view engine', 'ejs');
app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use((request, response, next) => {
  response.locals.query = ''
  next()
})

app.use('/', users)
app.use((request, response, next) => {
  const { user } = request
  response.locals.user = user
  next()
})

app.get('/sign_up', (request, response) => {
  response.render('sign_up')
})

app.get('/sign_in', (request, response) => {
  response.render('sign_in')
})

 app.use((req, res, next) => {
  if(req.user) {
    next()
  } else {
    res.redirect('/sign_in')
  }
 })

app.get('/', (request, response) => {
  const contacts = database.getContacts()
  .then((contacts) => {response.render('index', { contacts })})
  .catch( err => console.log('err', err) )
})

app.use('/contacts', contacts)

app.use((request, response) => {
  response.render('not_found')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
