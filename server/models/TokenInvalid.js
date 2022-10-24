import mongoose from 'mongoose';

const tokenInvalidSchema = new mongoose.Schema(
	{
		token: String,
	},
	{
		timestamps: true,
		collection: 'tokenInvalid',
	}
);

export default mongoose.model('TokenInvalid', tokenInvalidSchema);
