const joi = require('joi');

const registerSchema = joi.object({
  name: joi.string().min(2).max(100).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required()
})

const validateUser = (userData) => {
  return registerSchema.validate(userData)
}

module.exports = {
  validateUser
}