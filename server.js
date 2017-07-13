const express = require('express')
const passport = require('passport')
const session = require('express-session')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const database = require('./database/database')
const {renderError} = require('./server/utils')
const contacts = require('./server/routes/contacts')
const users = require('./server/routes/auth')
const app = express()

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
app.use(flash())

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

app.get('/tos', (request, response) => {
  response.render('tos')
})

app.get('/', (request, response) => {
  response.render('index')
})

app.get('/sign_up', (request, response) => {
  response.render('sign_up', { creationError: request.flash('creationError')})
})

app.get('/sign_in', (request, response) => {
  response.render('sign_in', { loginError: request.flash('loginError') })
})

 app.use((req, res, next) => {
  if(req.user) {
    next()
  } else {
    res.redirect('/sign_in')
  }
 })

app.get('/home', (request, response) => {
  const contacts = database.getContacts()
  .then((contacts) => {response.render('home', { contacts })})
  .catch( err => console.log('err', err) )
})

app.use('/contacts', contacts)

app.get('/sign-out', (request, response) => {
  console.log(`${request.user.email} signed out`)
  request.logout()
  response.redirect('/')
})


app.use((request, response) => {
  response.render('not_found')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
