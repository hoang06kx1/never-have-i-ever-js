import express from 'express';
// controllers
import room from '../controllers/room.js';

const router = express.Router();

router
	.get('/', room.onGetAllRooms)
	.post('/', room.onCreateRoom)
	.get('/:id', room.onGetRoomById)
	.delete('/:id', room.onDeleteRoomById);

export default router;
