const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email().required(),
    registrationId: Joi.string().alphanum().min(4).max(20).required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};

module.exports = { registerValidation, loginValidation };
