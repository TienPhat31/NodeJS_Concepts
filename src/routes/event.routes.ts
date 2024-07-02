import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { voucherValidate } from '../middleware/event.validator.middleware';
import { authenticateJWT } from '../middleware/auth.middleware';

const voucherRouter = Router();

// Get list of event
voucherRouter.get('/', authenticateJWT, eventController.getAllEvent);

// Add new event
voucherRouter.post(
  '/',
  voucherValidate,
  authenticateJWT,
  eventController.addNewEvent
);

// Create new voucher depend on maxQuantity of event
voucherRouter.post(
  '/:eventID/voucher',
  authenticateJWT,
  eventController.requestVoucher
);

// Get Edit modal
voucherRouter.get('/:eventID/edit', authenticateJWT, eventController.getEditPage)

// Check there is user editing modal or not
voucherRouter.post('/:eventID/editable/me', authenticateJWT, eventController.checkEditable)
voucherRouter.get('/:eventID/editable/release', authenticateJWT, eventController.releaseEditing)
export default voucherRouter;
