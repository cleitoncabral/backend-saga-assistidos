const mongoose = require('mongoose')

const contentWatchedSchema = new mongoose.Schema({
  contentId: String,
  rate: Number,
  comment: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
})

contentWatchedSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('contentWatched', contentWatchedSchema)