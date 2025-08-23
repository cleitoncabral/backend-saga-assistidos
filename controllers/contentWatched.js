const contentWatchedRouter = require('express').Router()
const ContentWatched = require('../models/contentWatched')
const {tokenExtractor, userExtractor} = require('../utils/middleware')
const logger = require('../utils/logger')
const User = require('../models/user')
const contentWatched = require('../models/contentWatched')

contentWatchedRouter.get('/', tokenExtractor, userExtractor, async (request, response) => {
  try {
    const contentWatched = await ContentWatched.find({'_id': {$in: request.user.contentWatched}}).populate('user', {name: 1, email: 1})
    response.status(200).json(contentWatched)
  } catch (error) {
    response.status(400).json({error: error})
  }
})

contentWatchedRouter.get('/:id', tokenExtractor, async (request, response) => {
  try {
    const contentWatched = await ContentWatched.findById(request.params.id).populate('user', {name: 1, email: 1})
    response.status(200).json(contentWatched)
  } catch (error) {
    response.status(400).json({error: error})
  }

})

contentWatchedRouter.post('/create', tokenExtractor, userExtractor, async (request, response) => {
  const contentWatched =  new ContentWatched ({
    contentId: request.body.contentId,
    comment: request.body.comment ? request.body.comment : '',
    rate: request.body.rate ? request.body.rate : 0
  })
  const user = request.user

  if (!user) return response.status(401).json({error: 'Token de usuário inválido'})
  if (!contentWatched.comment && !contentWatched.rate) return response.status(400).json({error: 'É necessário que um dos campos esteja preenchido!'})

  contentWatched.user = user._id

  try {
    const result = await contentWatched.save()
    user.contentWatched = user.contentWatched.concat(result._id)

    await user.save()
    response.status(201).json(contentWatched)

  } catch (error) { 
    response.status(400).json({error: error})
  }
})

contentWatchedRouter.put('/update/:id', tokenExtractor, userExtractor, async (request, response) => {
  const contentWatchedUpdate = {
    comment: request.body.comment,
    rate: request.body.rate
  }

  try {
    const result = await ContentWatched.findByIdAndUpdate(request.body.id, contentWatchedUpdate)
    const dataUpdated = await ContentWatched.find({'_id': {$in: request.user.contentWatched}}).populate('user', {name: 1, email: 1})

    response.status(201).json(dataUpdated)
  } catch (error) {
    response.status(400).json({error: error})
  }
})

contentWatchedRouter.delete('/delete/:id', tokenExtractor, userExtractor, async (request, response) => {
  if (!request.userId) return response.status(401).json({error: 'invalid token'})
  
  try {
    await User.findOneAndUpdate({_id: request.userId.id},
      {$pull: {contentWatched: request.params.id}},
      {multi: true}
    )
    await ContentWatched.findByIdAndRemove(request.params.id)
    const result = await ContentWatched.find({'_id': {$in: request.user.contentWatched}}).populate('user', {name: 1, email: 1})
    
    response.status(200).json(result)
  } catch (error) {
    response.status(400).json({error: error})
  }
})

contentWatchedRouter.delete('/deleteAll', tokenExtractor, userExtractor, async (request, response) => {
  // await User.updateOne({_id: request.userId.id},
  //   {$pull: {contentWatched: {$in: test.contentWatched}}}, {new: true}
  //   )
  
  if (!request.userId) return response.status(401).json({error: 'invalid token'})

  try {
    const user = await User.findById({_id: request.userId.id})
    await ContentWatched.deleteMany()

    user.contentWatched = []
    await user.save()

    response.status(204).end()
  } catch (error) {
    response.status(400).json({error: error})
  }

})

module.exports = contentWatchedRouter