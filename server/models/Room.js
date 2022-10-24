import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const Schema = mongoose.Schema;

const roomSchema = new Schema(
	{
		_id: {
			type: String,
			default: () => uuidv4().replace(/\-/g, ''),
		},
		userId: { type: Schema.Types.Mixed },
		questions: [{ type: Schema.Types.Mixed }],
	},
	{
		timestamps: true,
		collection: 'rooms',
	}
);

export default mongoose.model('Room', roomSchema);
