import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import userController from '../controllers/user.controller';

const router = Router();

router.post('/login', UserController.loginUser);
router.get('/index', authenticateJWT, userController.index);

router.get('/', authenticateJWT, UserController.getAllUser);
router.post('/', authenticateJWT, UserController.addUser);
router.put('/:id', authenticateJWT, UserController.editUser);
router.delete('/:id', authenticateJWT, UserController.deleteUser);

export default router;
