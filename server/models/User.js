import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			default: () => uuidv4().replace(/\-/g, ''),
		},
		username: String,
		password: String,
		email: String,
		type: { type: String, default: 'user' },
	},
	{
		timestamps: true,
		collection: 'users',
	}
);

export default mongoose.model('User', userSchema);
