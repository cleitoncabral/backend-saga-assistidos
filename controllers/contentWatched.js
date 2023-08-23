const contentWatchedRouter = require('express').Router()
const ContentWatched = require('../models/contentWatched')

contentWatchedRouter.get('/', async (request, response) => {
  const contentWatched = await ContentWatched.find({}).populate('user', {email: 1, name: 1})
  response.json(contentWatched)
})

contentWatchedRouter.get('/:id', async (request, response) => {
  const contentWatched = await ContentWatched.findById(request.params.id).populate('user', {name: 1, email: 1})

  response.json(contentWatched)
})

contentWatchedRouter.post('/', async (request, response) => {
  const contentWatched =  new ContentWatched ({
    contentId: request.body.contentId,
    comment: request.body.comment ? request.body.comment : '',
    rate: request.body.rate ? request.body.rate : 0
  })

  const user = request.user

  if (!user) return response.status(401).json({error: 'Token de usuário inválido'})

  contentWatched.user = user._id

  const result = await contentWatched.save()

  user.contentWatched = user.contentWatched.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

contentWatchedRouter.put('/:id', async (request, response) => {
  const contentWatchedUpdate = {
    contentId: request.body.contentId,
    comment: request.body.comment,
    rate: request.body.rate
  }

  await ContentWatched.findByIdAndUpdate(request.params.id, contentWatchedUpdate)

  response.status(200).end()
})

contentWatchedRouter.delete('/:id', async (request, response) => {
  if (!request.userId) return response.status(401).json({error: 'invalid token'})

  const contentWatched = await ContentWatched.findById(request.params.id)
  const user = request.user

  if(user._id.toString() != contentWatched.user.toString() || !user._id || !contentWatched.user ) {
    return response.status(401).json({error: "this content doesn't belong to current user"})
  }

  await ContentWatched.findByIdAndRemove(request.params.id)

  response.status(204).end()
})

module.exports = contentWatchedRouter