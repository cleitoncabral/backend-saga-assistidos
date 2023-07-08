const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const {name, email, password} = request.body

  console.log(request.body)

  if (password.length < 3) {
    return response.status(400).json({error: 'Senha curta'})
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    name, 
    email,
    passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)

})

module.exports = usersRouter