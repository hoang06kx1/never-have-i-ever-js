import mongoose from 'mongoose';
import {v4 as uuidv4} from "uuid";

const usedQuestionSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			default: () => uuidv4().replace(/\-/g, ''),
		},
		identifier: String,
		questions: Array,
	},
	{
		timestamps: true,
		collection: 'usedQuestions',
	}
);

export default mongoose.model('UsedQuestion', usedQuestionSchema);
