import express from 'express';
// controllers
import user from '../controllers/user.js';
// middlewares
import { encode, decode } from '../middlewares/jwt.js';
import dotenv from 'dotenv';

const router = express.Router();
const process = dotenv.config().parsed;

router
	.post('/login', encode, (req, res, next) => {
		return res.status(200).json({
			success: true,
			accessToken: req.accessToken,
		});
	})
	.get('/logout', decode, user.onUserLogout)
	.get('/me', decode, user.onUserGetInfo)


export default router;
