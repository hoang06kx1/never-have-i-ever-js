import Room from './room.js';
import TempRoom from './tempRoom.js';
import Player from './player.js';
import RoomModel from '../models/Room.js';

class WebSockets {
	connection(socket) {
		console.log('connected');

		// The host start room
		socket.on('start room', async (data) => {
			/**
			 * Find the room in DB by roomId
			 */
			const socketId = socket.id;
			const roomId = data.roomId;
			const room = await RoomModel.findOne({ _id: roomId });

			if (room) {
				// found room
				const isRoomStart = Room.isStart(roomId); // check room if it already started

				if (!isRoomStart) {
					/**
					 * check if have player joined room before room is started
					 *  move player from temp room to offical room
					 */
					let players = TempRoom.isPlayerJoined(roomId);
					if (!players) {
						players = [];
					} else {
						// remove from players if the host in temp room
						const isHost = players.findIndex((player) => player.id == socketId);
						if (isHost !== -1) players.splice(isHost, 1);

						TempRoom.delete(roomId);
					}

					const host = Player.init(socketId, 'The host'); // init player object
					players.push(host);

					const newRoom = Room.start(
						socketId,
						room.userId,
						roomId,
						room.questions,
						players
					); // start room

					socket.join(roomId); // join as a host

					io.to(roomId).emit('room started', {
						playerCount: newRoom.player.length,
					}); // notify to all room's player

					const { questionId, questionContent, questionNo, questionTotal } =
						Room.currentQuestion(roomId);

					if (questionId)
						io.to(roomId).emit('current question', {
							questionId,
							questionContent,
							questionNo,
							questionTotal,
						}); // notify to host
				}
			} else {
				// Not found room
				socket.emit('room not found', 'Room not found, please check!');
			}
		});

		socket.on('check room', async (data) => {
			const roomId = data.roomId;
			let room = await RoomModel.findOne({ _id: roomId });

			if (room) {
				// chechk room is started
				room = Room.isStart(roomId);

				if (room) {
					socket.emit('room info', {
						started: true,
						playerCount: room?.player.length,
						hostId: room?.host.socketId,
					});
				} else {
					// check if have any player join the temp room
					const players = TempRoom.isPlayerJoined(roomId);
					if (players)
						socket.emit('room info', {
							started: false,
							playerCount: players?.length,
						});
					else
						socket.emit('room info', {
							started: false,
							playerCount: 0,
							hostId: null,
						});
				}
			} else {
				// Not found room
				socket.emit('room not found', 'Room not found, please check!');
			}
		});

		// The player join room
		socket.on('join room', (data) => {
			const socketId = socket.id;
			const roomId = data.roomId;
			const playerName = data.playerName.trim();
			const isRoomStart = Room.isStart(roomId); // check if room start or not
			let isSocketIdExist, isPlayernameExist;

			if (!isRoomStart) {
				isSocketIdExist = TempRoom.checkSocketId(roomId, socketId);
				isPlayernameExist = TempRoom.checkPlayerName(roomId, playerName);
			} else {
				if (isRoomStart.host.socketId == socketId) return; // host joining

				isSocketIdExist = Room.checkSocketId(roomId, socketId);
				isPlayernameExist = Room.checkPlayerName(roomId, playerName);
			}

			// check if player already joined or player name already exist
			if (isSocketIdExist || isPlayernameExist) {
				socket.emit('player exist', 'Player existed.'); //notify the player who request to join room
			} else {
				let room;
				const player = Player.init(socket.id, data.playerName); // init player object

				if (isRoomStart) {
					room = Room.addPlayer(roomId, player); // add player to room

					if (room) {
						io.to(roomId).emit('someone join', {
							player: `${player.name} joined the room.`,
							playerCount: room.player.length,
						}); // notify to all room's player

						// notify the player who request to join room
						socket.emit('joined room', { playerCount: room.player.length });
					}
				} else {
					// move player to tempRoom in case the room not start
					TempRoom.start(roomId);
					TempRoom.addPlayer(roomId, player);

					// notify the player who request to join room
					socket.emit('room not started', 'Room is not started yet.');
				}

				socket.join(roomId); // join as a player

				if (isRoomStart) {
					const { questionId, questionContent, questionNo, questionTotal } =
						Room.currentQuestion(roomId);

					if (questionId)
						socket.emit('current question', {
							questionId,
							questionContent,
							questionNo,
							questionTotal,
						}); // notify to the player who request to join room
				}
			}
		});

		socket.on('next question', (roomId) => {
			const { questionId, questionContent, questionNo, questionTotal } =
				Room.nextQuestion(roomId);

			if (!questionId) socket.emit('out of question', 'Out of question');
			else
				io.to(roomId).emit('new question', {
					questionId,
					questionContent,
					questionNo,
					questionTotal,
				}); // send notify to all room's player
		});

		// Save answer of the player
		socket.on('player answer', (data) => {
			const socketId = socket.id;
			const { roomId, questionId, answer } = data;

			// check if player is answered this question
			const isAnswered = Room.isPlayerAnswered(roomId, socketId, questionId);

			if (!isAnswered) {
				const { host, player, summary } = Room.saveAnswer(
					roomId,
					socketId,
					questionId,
					answer
				);

				// send notify to room's host
				if (host && player)
					socket.broadcast
						.to(host)
						.emit('player answered', `${player} answered question`);

				// send question summary to all player
				if (summary) io.to(roomId).emit('question summary', summary?.detail);
			}
		});

		// Return the room summary to room's people (include host)
		socket.on('summary', (roomId) => {
			const summary = Room.summary(roomId);
			socket.emit('summary result', summary);
		});

		// Return the room summary to room's people (include host) and delete the room
		socket.on('end game', (roomId) => {
			const summary = Room.summary(roomId);
			io.to(roomId).emit('summary result', summary);
			Room.delete(roomId);
		});

		// Someone get disconnected
		socket.on('disconnect', () => {
			const socketId = socket.id;

			/**
			 * Remove player if this player is joined in somewhere
			 */
			TempRoom.removePlayer(socketId);
			const { roomId, host, player, playerCount } = Room.removePlayer(socketId);

			if (roomId && playerCount)
				io.to(roomId).emit('update player count', {
					playerCount,
				}); // send notify to all room's player

			// notify to the room's host
			if (host && player)
				socket.broadcast.to(host).emit('someone leave', {
					player: `${player.name} has left`,
					playerCount,
				});
		});
	}
}

export default new WebSockets();
