import { Router } from 'express'
import UserController from '../controllers/user.controller'
import { authenticateJWT } from '../middleware/auth.middleware'
import validateRequest from '../middleware/user.validator.middleware'
import { userValidation } from '../middleware/user.validator.middleware'

const router = Router()

router.get('/register', UserController.getRegisterPage)
router.post('/register', UserController.register)
router.get('/login', UserController.getLoginPage)
router.post('/login', UserController.loginUser)

router.get('/', UserController.getAllUser)
router.post('/', validateRequest(userValidation), UserController.addUser)
router.put('/:id', validateRequest(userValidation), UserController.editUser)
router.delete('/:id', UserController.deleteUser)

export default router
