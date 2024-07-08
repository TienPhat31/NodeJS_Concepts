import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Schema } from 'joi'

export const eventSchema = Joi.object({
  eventID: Joi.string().required(),
  eventName: Joi.string().required(),
  maxQuantity: Joi.number().required()
})

// Tạo middleware để xác thực request
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
