import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import userController from '../controllers/user.controller';

const router = Router();

router.get('/register', userController.getRegisterPage);
router.post('/register', userController.register);
router.get('/login', userController.getLoginPage);
router.post('/login', UserController.loginUser);

router.get('/', authenticateJWT, UserController.getAllUser);
router.post('/', authenticateJWT, UserController.addUser);
router.put('/:id', authenticateJWT, UserController.editUser);
router.delete('/:id', authenticateJWT, UserController.deleteUser);


router.get("/index", authenticateJWT, UserController.getIndexPage)
export default router;
