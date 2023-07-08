const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { nextTick } = require('process')

const tokenExtractor = (request, require) => {
  const authorization = request.get('authorization')

  try {
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      const decodedToken = jwt.verify(token, process.env.SECRET)
      request.userId = decodedToken
    } else {
      logger.error('error')
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({error: 'token inválido'})
    }
    return nextTick(error)
  }
  next()
}

module.exports = {
  tokenExtractor
}