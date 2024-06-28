import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const eventSchema = Joi.object({
  eventID: Joi.string().required(),
  eventName: Joi.string().required(),
  maxQuantity: Joi.number().required(),
});

export const voucherValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = eventSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: error.details[0].message.replace(/"/g, '') });
  }
  next();
};
