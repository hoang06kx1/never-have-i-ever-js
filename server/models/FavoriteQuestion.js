import mongoose from 'mongoose';
import {v4 as uuidv4} from "uuid";

const favoriteQuestionSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			default: () => uuidv4().replace(/\-/g, ''),
		},
		userId: String,
		questions: Array,
	},
	{
		timestamps: true,
		collection: 'favoriteQuestions',
	}
);

export default mongoose.model('FavoriteQuestion', favoriteQuestionSchema);
