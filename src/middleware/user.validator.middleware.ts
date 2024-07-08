import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { Schema } from 'joi'

export const userValidation = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().required()
})

const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message.replace(/"/g, '') })
    }
    next()
  }
}

export default validateRequest
