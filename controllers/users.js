const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const contentWatched = require('../models/contentWatched')
const { userExtractor } = require('../utils/middleware')
const { registerSchema } = require('../validators/userValidator')

usersRouter.post('/register', async (request, response) => {
  const {error, value } = registerShema.validate(request.body)
  if (error) {
    return response.status(400).json({error: error.details[0].message})
  }
  const {name, email, password} = request.body
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const isValid = emailRegexp.test(email)
  
  if (!isValid) return response.status(400).json({error: 'Tipo de e-mail não existe!'})

  try {
    if (await User.findOne({email})) {
      return response.status(400).json({error: 'Um perfil com esse e-mail já existe!'})
    }
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
  } catch (error) {
    logger.error(error)
  }

})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('contentWatched', {contentId: 1, comment: 1, rate: 1})
  response.json(users)
})

usersRouter.delete('/delete/:id', async (request, response) => {
  if (!request.userId) return response.status(401).json({error: 'Item não encontrado'})

  const user = request.user
  
  user.contentWatched.forEach(async element => {
    await contentWatched.findByIdAndRemove(element.toString())
  });

  await User.findByIdAndRemove(request.params.id)
  response.status(204).end()

})

module.exports = usersRouter