// models
import UsedQuestionModel from '../models/UsedQuestion.js';

// utils
import makeValidation from '@withvoid/make-validation';
import Category from '../models/Category.js';
import { validationResult } from 'express-validator';

export default {
	onGetAllCategory: async (req, res) => {
		try {
			const categories = await Category.find().select('-questions');

			return res.status(200).json({ success: true, categories });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onCreateCategory: async (req, res) => {
		try {
			// validate request parameters
			const validation = makeValidation((types) => ({
				payload: req.body,
				checks: {
					categoryName: { type: types.string },
					description: { type: types.string },
					questions: { type: types.array, options: {
						unique: true,
						stringOnly: true
					}},
				},
			}));

			if (!validation.success) return res.status(400).json(validation);

			const { level, categoryName, questions } = req.body;

			// validate if category name exist in our database
			const existCategory = await Category.findOne({ categoryName });

			if (existCategory) {
				return res.status(409).json({
					success: false,
					message: "Kindly fix the error(s)",
					errors: {
						categoryName: "Category name already exist."
					}
				});
			}

			// create category
			const category = await Category.create({
				categoryName,
				questions,
				level
			});

			return res.status(201).json({ success: true, category });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onUpdateCategory: async (req, res) => {
		try {
			// validate request parameters
			const validation = makeValidation((types) => ({
				payload: req.body,
				checks: {
					categoryName: { type: types.string },
					questions: { type: types.array, options: {
						unique: true,
						stringOnly: true
					}},
				},
			}));

			if (!validation.success) return res.status(400).json(validation);

			const { level, categoryName, questions } = req.body;

			// validate if category name exist in our database
			const existCategory = await Category.findOne({ categoryName });

			if (existCategory && existCategory._id != req.params.id) {
				return res.status(409).json({
					success: false,
					message: "Kindly fix the error(s)",
					errors: {
						categoryName: "Category name already exist."
					}
				});
			}

			// update category
			const { id } = req.params
			const category = await Category.findOneAndUpdate(
				{ _id: id },
				{ level, categoryName, questions },
				{ new: true }
			);

			return res.status(200).json({ success: true, category });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onGetCategoryById: async (req, res) => {
		// this function randomly returns a number of questions according to the selected category
		try {
			// validate request parameters
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({ success: false, errors: errors.array() })
			}

			// get category
			const { id } = req.params
			const category = await Category.findOne({ "_id": id });

			if (!category) return res.status(404).json({ success: false, message: "Model not found" });

			// get the list of questions that the user has received in previous requests
			// User is identified based on userId and deviceId
			// Because when the user is not logged in the deviceId will be stored with the questions that were used to identify the subject.
			const usedQuestions = await UsedQuestionModel.find({ identifier: { $in: [req.user?.userId, req.query.deviceId]}}).select('questions -_id')

			if (usedQuestions.length) {
				// merge question arrays into one array
				let questions = usedQuestions.map(item => item.questions).flat(1)

				if (questions.length + parseInt(req.query.number) > category.questions.length) {
					// reset the used question array in case the number of questions remaining is not enough
					await UsedQuestionModel.deleteMany({ identifier: { $in: [req.user?.userId, req.query.deviceId]}})
				} else {
					// exclude used questions from the category's question array
					category.questions = category.questions.filter(x => !questions.includes(x));
				}
			}

			// randomly sort array elements
			let shuffled = category.questions.sort(() => {
				return 0.5 - Math.random()
			});

			// retrieve the required number of questions
			category.questions = shuffled.slice(0, req.query.number);

			// define identifier, if user is logged in get userId, otherwise get deviceId
			const identifier = req.user?.userId ? req.user.userId : req.query.deviceId

			// save the returned questions to the list of questions that have been used to exclude in future requests
			await UsedQuestionModel.updateOne(
				{
					identifier: identifier
				},
				{
					identifier: identifier,
					$addToSet: {
						questions: category.questions
					}
				},
				{
					upsert: true, setDefaultsOnInsert: true
				}
			)

			return res.status(200).json({ success: true, data: category });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onDeleteCategoryById: async (req, res) => {
		try {
			// get category
			const { id } = req.params
			const category = await Category.findOne({ "_id": id });

			if (!category) return res.status(404).json({ success: false, message: "Model not found" });

			// delete category if found
			await Category.remove({ "_id": id });

			return res.status(200).json({ success: true, message: "Operation performed successfully" });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
};
