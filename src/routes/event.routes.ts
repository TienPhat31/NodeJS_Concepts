import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { voucherValidate } from '../middleware/event.validator.middleware';

const voucherRouter = Router();

voucherRouter.get('/', eventController.getAllEvent);
voucherRouter.post('/', voucherValidate, eventController.addNewEvent);
voucherRouter.post('/:eventID/voucher', eventController.requestVoucher)

export default voucherRouter