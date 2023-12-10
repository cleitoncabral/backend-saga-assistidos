const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { nextTick } = require('process')

const unknownEndPoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if(error.name === 'JsonWebtokenError') {
    return response.status(400).json({error: error.message})
  } else if (error.name === 'TokenExpiredError'){
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

// const tokenExtractor = (request, response, next) => {
//   const authorization = request.get('authorization')
//   try {
//     if (authorization && authorization.startsWith('Bearer ')) {
//       const token = authorization.replace('Bearer ', '')
//       const decodedToken = jwt.verify(token, process.env.SECRET)
//       return request.userId = decodedToken
//     } else {
//       logger.error('error')
//     }
//   } catch (error) {
//     if (error instanceof jwt.JsonWebTokenError) {
//       response.status(401).json({error: 'token invalid'})
//       return null;
//     }
//   }
// }

const tokenExtractor = (request, response, next) => {
  const authorization = request.headers['authorization']

  const token = authorization && authorization.split(' ')[1]

  if(!token) {
    response.status(401).json({error: 'token invalido'})
  }
  try {
    request.userId = jwt.verify(token, process.env.SECRET)
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({error: 'token invalido'})
      return null
    }
  }
}

const userExtractor = async (request, response, next) => {
  try {
    const token = request.userId
    console.log(request.body)
    if(token) {
      const user = await User.findById(token.id)
      request.user = user
    }
    // return response.status(401).json({error: 'user invalid'})
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({error: 'user invalid'})
    }
  }

  next()
}

module.exports = {
  tokenExtractor,
  userExtractor,
  unknownEndPoint,
  errorHandler
}