const contentWatched = require('../models/contentWatched')
const ContentWatched = require('../models/contentWatched')
const User = require('../models/user')

const getAllUserContentWatched = async (userId) => {
  const user = await User.findById(userId)
  return await ContentWatched.find({ '_id': { $in: user.contentWatched } })
    .populate('user', { name: 1, email: 1 })
}

const createContent = async (userId, contentData) => {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'Usuário não encontrado')

  const content = new contentWatched({
    ...contentData,
    user: userId
  })

  const savedContent = await content.save()
  user.contentWatched = user.contentWatched.concat(savedContent._id)
  await user.save()

  return savedContent
}

module.exports = {
  getAllUserContentWatched,
  createContent
}