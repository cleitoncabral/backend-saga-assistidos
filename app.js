const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const contentWatched = require('./controllers/contentWatched')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI).then(() => {
  logger.info('connected to MongoDB')
}).catch((error) => {
  logger.error('error to connecting to  MongoDB:', error.message)
})

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use('/api/contentWatched', contentWatched)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

module.exports = app
