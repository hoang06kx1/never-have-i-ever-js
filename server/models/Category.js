import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const categorySchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			default: () => uuidv4().replace(/\-/g, ''),
		},
		categoryName: String,
		description: String,
		level: Number,
		questions: mongoose.Schema.Types.Mixed
	},
	{
		timestamps: true,
		collection: 'categories',
	}
);

export default mongoose.model('Category', categorySchema);
