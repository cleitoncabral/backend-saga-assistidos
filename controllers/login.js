const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')
const { tokenExtractor, userExtractor } = require('../utils/middleware')

loginRouter.post('/', async (request, response) => {
  try {
    const {email, password} = request.body
    const user = await User.findOne({email}).populate('contentWatched', {contentId: 1, comment: 1, rate: 1 })
    
    try {
      if (!user) {
        return response.status(401).json({
          statusCode: 401,
          message: 'E-mail incorreto!'
        })
      }
      
      const passwordValidation = bcrypt.compareSync(password, user.passwordHash)

      if (!passwordValidation) {
        return response.status(401).json({
          statusCode: 401,
          message: 'Senha incorreta',
        })
      }
      
      const userForToken = {
        email: user.email,
        id: user._id
      }

      const token = jwt.sign(userForToken, process.env.SECRET, {
        audience: 'urn:jwt:type:access', //who is generating token
        issuer: 'urn:system:token-issuer:type:access', // who is the destiny of token
        expiresIn: 60*60
      })

      response.status(200).send({token, email: user.email, name: user.name, contentWatched: user.contentWatched})
    } catch (error) {
      logger.error(error)
    }
  } catch (error) {
    logger.error(error)
  }
})

loginRouter.get('/autoLogin', tokenExtractor,  userExtractor, async (request, response) => {
  const user = await User.findById(request.userId.id).populate('contentWatched', {contentId: 1, comment: 1, rate: 1 })
  
  response.status(200).send(user)
})

loginRouter.post('/validate', async (request, response) => {
  const token = jwt.sign(request.body.token, process.env.SECRET)

  response.status(200).send({token})
})

loginRouter.post('/logout', (request, response) => {
  const authToken = request.body.headers['Authorization'].split(' ')[1]

  jwt.sign(authToken, '', {expiresIn: 1}, (logout, error) => {
    logout ? response.send({message: 'You have been logged out'}) : response.send({message: 'Error'})
  })
  
})

module.exports = loginRouter