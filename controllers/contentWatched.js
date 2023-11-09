const contentWatchedRouter = require('express').Router()
const ContentWatched = require('../models/contentWatched')
const {tokenExtractor, userExtractor} = require('../utils/middleware')

contentWatchedRouter.get('/', tokenExtractor, userExtractor, async (request, response) => {
  //See more about middleware and how to use better
  const contentWatched = await ContentWatched.find({'_id': {$in: request.user.contentWatched}}).populate('user', {name: 1, email: 1})
  response.json(contentWatched)
})

contentWatchedRouter.get('/:id', tokenExtractor, async (request, response) => {
  console.log(request.params.id)
  const contentWatched = await ContentWatched.findById(request.params.id).populate('user', {name: 1, email: 1})

  response.json(contentWatched)
})

contentWatchedRouter.post('/create', tokenExtractor, userExtractor, async (request, response) => {
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
  console.log(user)
  response.status(201).json(user.contentWatched)
})

contentWatchedRouter.put('/update/:id', tokenExtractor, userExtractor, async (request, response) => {
  const contentWatchedUpdate = {
    comment: request.body.comment,
    rate: request.body.rate
  }

  const result = await ContentWatched.findByIdAndUpdate(request.arams.id, contentWatchedUpdate)

  response.status(200).json(result)
})

contentWatchedRouter.delete('/delete/:id', tokenExtractor, userExtractor, async (request, response) => {
  if (!request.userId) return response.status(401).json({error: 'invalid token'})
  console.log(request.user)

  const contentWatched = await ContentWatched.findById(request.params.id)
  const user = request.user

  if(user._id.toString() != contentWatched.user.toString() || !user._id || !contentWatched.user ) {
    return response.status(401).json({error: "this content doesn't belong to current user"})
  }

  await ContentWatched.findByIdAndRemove(request.params.id)

  response.status(204).end('Deleted!')
})

contentWatchedRouter.delete('/deleteAll', tokenExtractor, userExtractor, async (request, response) => {
  if (!request.userId) return response.status(401).json({error: 'invalid token'})
  try {
    await ContentWatched.deleteMany()
    response.status(204).end()
  } catch (err) {
    console.error(err)
  }

})

module.exports = contentWatchedRouter