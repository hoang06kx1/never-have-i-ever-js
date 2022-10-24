import express from 'express';
// middleware
import { decode } from '../middlewares/jwt.js';
import { isAdmin } from '../middlewares/authorization.js';
// controllers
import user from '../controllers/user.js';

const router = express.Router();

router
	.get('/', [decode, isAdmin], user.onGetAllUsers)
	.post('/', user.onCreateUser)
	.get('/:id', [decode, isAdmin], user.onGetUserById)
	.patch('/:id/change-password', decode, user.onChangePassword)
	.post('/reset-password', user.onResetPassword)
	.post('/:id/reset-password/:token', user.onResetPasswordToken)

export default router;
