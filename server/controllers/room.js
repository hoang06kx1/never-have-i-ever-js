// utils
import makeValidation from '@withvoid/make-validation';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// models
import RoomModel from '../models/Room.js';

const tokenKey = dotenv.config().parsed.TOKEN_KEY;

export default {
	onGetAllRooms: async (req, res) => {
		try {
			// get rooms
			const rooms = await RoomModel.find({});

			return res.status(201).json({ success: true, rooms });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onGetRoomById: async (req, res) => {
		try {
			const { id } = req.params;

			// get room
			const room = await RoomModel.findOne({ _id: id });

			// validate if room exist in our database
			if (!room)
				return res
					.status(404)
					.json({ success: false, message: 'Model not found' });

			return res.status(200).json({ success: true, room });
		} catch (error) {
			return res.status(500).json({ success: false, error });
		}
	},
	onCreateRoom: async (req, res) => {
		try {
			// validate request parameters
			const validation = makeValidation((types) => ({
				payload: req.body,
				checks: {
					questions: {
						type: types.array,
						options: {
							unique: true,
							stringOnly: true,
						},
					},
					userId: { type: types.string },
				},
			}));

			if (!validation.success) return res.status(400).json(validation);

			const rawQuestions = req.body.questions;
			let userId = req.body.userId;
			let questions = [];

			// prepare questions
			rawQuestions.forEach((question) => {
				questions.push({
					id: uuidv4().replace(/\-/g, ''),
					content: question,
				});
			});

			// check if user logged in
			if (req.headers['authorization']) {
				const accessToken = req.headers.authorization.split(' ')[1];

				if (accessToken) {
					const decoded = jwt.verify(accessToken, tokenKey);
					userId = decoded?.userId;
				}
			}

			// create room
			const room = await RoomModel.create({ questions, userId });

			return res.status(201).json({ success: true, room });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onDeleteRoomById: async (req, res) => {
		try {
			const { id } = req.params;
			// get room
			const room = await RoomModel.findOne({ _id: id });

			// validate if room exist in our database
			if (!room)
				return res
					.status(404)
					.json({ success: false, message: 'Model not found' });

			await RoomModel.remove({ _id: id });

			return res
				.status(201)
				.json({ success: true, message: 'Operation performed successfully' });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
};
