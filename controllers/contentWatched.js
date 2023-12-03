const contentWatchedRouter = require('express').Router()
const ContentWatched = require('../models/contentWatched')
const {tokenExtractor, userExtractor} = require('../utils/middleware')
const logger = require('../utils/logger')
const User = require('../models/user')
const contentWatched = require('../models/contentWatched')

contentWatchedRouter.get('/', tokenExtractor, userExtractor, async (request, response) => {
  //See more about middleware and how to use better
  const contentWatched = await ContentWatched.find({'_id': {$in: request.user.contentWatched}}).populate('user', {name: 1, email: 1})
  response.json(contentWatched)
})

contentWatchedRouter.get('/:id', tokenExtractor, async (request, response) => {
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

  console.log(request.body)
  
  const result = await ContentWatched.findByIdAndUpdate(request.body.id, contentWatchedUpdate)
  const dataUpdated = await ContentWatched.find({})
  console.log(dataUpdated)

  response.status(200).json(dataUpdated)
})

contentWatchedRouter.delete('/delete/:id', tokenExtractor, userExtractor, async (request, response) => {
  // await User.findOneAndUpdate({_id: '64f911aa4d14e007f8d49f6f'},
  //   {$pull: {contentWatched: '656a6c9b0c7d3012ae5c917b'}},
  //   {multi: true}
  // )
  if (!request.userId) return response.status(401).json({error: 'invalid token'})
  try {
    await ContentWatched.findByIdAndRemove(request.params.id)
    const result = ContentWatched.find({'_id': {$in: request.user.contentWatched}}).populate('user', {name: 1, email: 1})
    response.status(200).json(result)
  } catch (err) {
    console.error(err)
  }
})

contentWatchedRouter.delete('/deleteAll', tokenExtractor, userExtractor, async (request, response) => {
  const test = await User.findById({_id: '64f911aa4d14e007f8d49f6f'})
  // await test.collection.deleteMany({_id: {$in: test.contentWatched}})
  // console.log(test.contentWatched)

  User.collection.update({},
    {$pull: { contentWatched: { $in: "64f911aa4d14e007f8d49f6f"}}},
    { multi: true });

  // const res = await User.find(request.params)
  if (!request.userId) return response.status(401).json({error: 'invalid token'})
  try {
    await ContentWatched.deleteMany()
    response.status(204).end()
  } catch (err) {
    console.error(err)
  }

})
module.exports = contentWatchedRouter