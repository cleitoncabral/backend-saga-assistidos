const contentWatchedRouter = require('express').Router()
const ContentWatched = require('../models/contentWatched')

contentWatchedRouter.get('/', async (request, response) => {
  const contentWatched = await ContentWatched.find({}).populate('user', {email: 1, name: 1})
  response.json(contentWatched)
})

contentWatchedRouter.post('/', async (request, response) => {
  const contentWatched =  new ContentWatched ({
    contentId: request.body.contentId,
    comment: request.body.comment ? request.body.comment : '',
    rate: request.body.rate ? request.body.rate : 0
  })

  console.log(request.user)
  console.log(request.body)

  const user = request.user

  if (!user) return response.status(401).json({error: 'Token de usuário inválido'})

  contentWatched.user = user._id

  const result = await contentWatched.save()

  user.contentWatched = user.contentWatched.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

module.exports = contentWatchedRouter