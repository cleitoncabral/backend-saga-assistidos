const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { nextTick } = require('process')

const tokenExtractor = (request, response, next) => {
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
      return response.status(401).json({error: 'token invalid'})
    }
    return nextTick(error)
  }
  next()
}

const userExtractor = async (request, response, next) => {
  try {
    const token = request.userId

    if(token) {
      const user = await User.findById(token.id)
      request.user = user
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({error: 'user invalid'})
    }
    return null
  }

  next()
}

module.exports = {
  tokenExtractor,
  userExtractor
}