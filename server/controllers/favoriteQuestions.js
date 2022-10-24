// models
import FavoriteQuestionModel from '../models/FavoriteQuestion.js';
import {validationResult} from "express-validator";

export default {
	onGetAllFavoriteQuestions: async (req, res) => {
		try {
			// get favorite question
			let favoriteQuestion = await FavoriteQuestionModel.findOne({ "userId": req.user.userId });

			return res.status(200).json({ success: true, data: favoriteQuestion });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onAddFavoriteQuestions: async (req, res) => {
		try {
			// validate request parameters
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({ success: false, errors: errors.array() })
			}

			// get favorite question
			let favoriteQuestion = await FavoriteQuestionModel.findOne({ userId: req.user.userId });

			if (!favoriteQuestion) {
				// create a new one if the resource doesn't exist yet
				favoriteQuestion = await FavoriteQuestionModel.create({
					userId: req.user.userId,
					questions: req.body.questions
				});
			} else {
				// add questions to resource if it already exists
				favoriteQuestion.questions.addToSet(...req.body.questions)
				favoriteQuestion.save()
			}

			return res.status(200).json({ success: true, data: favoriteQuestion });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onUpdateFavoriteQuestions: async (req, res) => {
		try {
			// validate request parameters
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({ success: false, errors: errors.array() })
			}

			// get favorite question
			let favoriteQuestion = await FavoriteQuestionModel.findOne({ userId: req.user.userId });

			if (!favoriteQuestion) return res.status(404).json({ success: false, message: "Model not found" })

			// update resource if it already exists
			favoriteQuestion.questions = req.body.questions
			favoriteQuestion.save()

			return res.status(200).json({ success: true, data: favoriteQuestion });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
};
