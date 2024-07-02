import Joi from 'joi';

export const userValidation = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().required(),
});
