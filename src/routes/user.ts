import { Router } from 'express';
import userController from '@/controllers/user';

const router = Router();

router.post('/signup', userController.signup);
router.post('/signin', userController.signin);

export default router;
