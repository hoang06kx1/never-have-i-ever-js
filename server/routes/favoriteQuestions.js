import express from 'express';
// middleware
import { decode } from '../middlewares/jwt.js';
// controllers
import favoriteQuestions from '../controllers/favoriteQuestions.js';
import {check} from "express-validator";

const router = express.Router();

router
	.get('/', decode, favoriteQuestions.onGetAllFavoriteQuestions)
	.post('/', [
		decode,
		check('questions').isArray()
	], favoriteQuestions.onAddFavoriteQuestions)
	.put('/', [
		decode,
		check('questions').isArray()
	], favoriteQuestions.onUpdateFavoriteQuestions)

export default router;
