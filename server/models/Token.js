import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
	{
		userId: String,
		token: String,
		createdAt: {
			type: Date,
			default: Date.now,
			expires: 3600,
		},
	}
);

export default mongoose.model('Token', tokenSchema);
