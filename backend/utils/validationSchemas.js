const Joi = require('joi');

// User update validation schema
const userUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot be more than 50 characters'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Invalid email format'
    }),
  mobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Mobile number must be 10 digits'
    }),
  role: Joi.string()
    .valid('user', 'admin', 'vendor')
    .optional()
});

module.exports = {
  userUpdateSchema
};