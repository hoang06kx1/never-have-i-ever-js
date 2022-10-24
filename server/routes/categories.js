import express from 'express';
// middleware
import {decode, getUser} from '../middlewares/jwt.js';
import { isAdmin } from '../middlewares/authorization.js';
import { check } from 'express-validator';
// controllers
import categories from '../controllers/categories.js';

const router = express.Router();

router
	.get('/', categories.onGetAllCategory)
	.post('/', [decode, isAdmin], categories.onCreateCategory)
	.put('/:id', [decode, isAdmin], categories.onUpdateCategory)
	.get('/:id', [
		getUser,
		check('number').isNumeric(),
		check('deviceId').isString()
	], categories.onGetCategoryById)
	.delete('/:id', [decode, isAdmin], categories.onDeleteCategoryById);

export default router;
