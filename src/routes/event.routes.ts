import { Router } from 'express'
import eventController from '../controllers/event.controller'
import { authenticateJWT } from '../middleware/auth.middleware'
import validateRequest from '../middleware/event.validator.middleware'
import { eventSchema } from '../middleware/event.validator.middleware'

const voucherRouter = Router()

// Get list of event
voucherRouter.get('/', authenticateJWT, eventController.getAllEvent)

// Get list of vouchers
voucherRouter.get('/vouchers', eventController.getAllVoucher)

// Add new event
voucherRouter.post('/', validateRequest(eventSchema), eventController.addNewEvent)

// Create new voucher base on maxQuantity of event
voucherRouter.post('/:eventID/voucher', eventController.requestVoucher)

// Get Edit modal
voucherRouter.get('/:eventID/edit', eventController.getEditModal)

// Check there is user editing modal or not
voucherRouter.post('/:eventID/editable/me', authenticateJWT, eventController.checkEditable)
voucherRouter.post('/:eventID/editable/release', authenticateJWT, eventController.releaseEditing)
voucherRouter.post('/:eventID/editable/maintain', authenticateJWT, eventController.maintainEditing)
export default voucherRouter
