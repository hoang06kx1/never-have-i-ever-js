let rooms = [];

class Room {
	start(socketId, userId, roomId, questions, players) {
		let room = {
			id: roomId,
			host: {
				socketId,
				userId,
			},
			player: players,
			summary: [],
			questionNo: 1,
			questionTotal: questions.length,
		};

		questions.forEach((question) => {
			room.summary.push({
				questionId: question.id,
				questionContent: question.content,
				yes: 0,
				no: 0,
				detail: [],
			});
		});

		rooms.push(room);
		return room;
	}
	isStart(roomId) {
		return rooms.find((room) => room.id === roomId);
	}
	checkSocketId(roomId, socketId) {
		const room = rooms.find((room) => room.id === roomId);
		return room?.player.find((player) => player.id === socketId);
	}
	checkPlayerName(roomId, name) {
		const room = rooms.find((room) => room.id === roomId);
		return room?.player.find((player) => player.name === name);
	}
	addPlayer(roomId, player) {
		let room = rooms.find((room) => room.id === roomId);

		room?.player.push(player);
		return room;
	}
	removePlayer(socketId) {
		let roomId, host, removePlayer, playerCount;

		for (let index = 0; index < rooms.length; index++) {
			removePlayer = rooms[index].player.find(
				(player) => player.id === socketId
			);

			if (removePlayer) {
				/**
				 * find index and remove player from room's player list
				 */
				const room = rooms[index];
				index = room.player.findIndex((player) => player.id === socketId);
				room.player.splice(index, 1);

				roomId = room.id;
				host = room.host.socketId;
				playerCount = room.player.length;
				break;
			}
		}

		return { roomId, host, player: removePlayer, playerCount };
	}
	currentQuestion(roomId) {
		let room = rooms.find((room) => room.id === roomId);

		if (room) {
			const question = room.summary[room.questionNo - 1];

			return {
				questionId: question.questionId,
				questionContent: question.questionContent,
				questionNo: room.questionNo,
				questionTotal: room.questionTotal,
			};
		}

		return false;
	}
	nextQuestion(roomId) {
		let room = rooms.find((room) => room.id === roomId);

		// if (!room || room.questionNo === room.questionTotal) return false;
		if (!room) return false;

		const playerCount = room.player.length;
		let newQuestion;

		let oldQuestion = room.summary[room.questionNo - 1];
		let playerAnsweredIds = [];

		oldQuestion.detail.forEach((element) => {
			playerAnsweredIds.push(element.playerId);
		});
		const playerAnsweredCount = playerAnsweredIds.length;

		if (room.questionNo !== room.questionTotal) {
			newQuestion = room.summary[room.questionNo];
			room.questionNo++; // save room's current question no
		}

		// if the players dont answer, it will be Yes
		if (playerAnsweredCount < playerCount) {
			// Update room summary
			oldQuestion['yes'] += playerCount - playerAnsweredCount;

			// Update player's answer
			room.player.forEach((player) => {
				if (playerAnsweredIds.indexOf(player.id) === -1) {
					player.answer.push({
						questionId: oldQuestion.questionId,
						answer: 'yes',
					});
					player.total['yes']++;

					oldQuestion.detail.push({
						playerId: player.id,
						playerName: player.name,
						answer: 'yes',
					});
				}
			});
		}

		return {
			questionId: newQuestion?.questionId,
			questionContent: newQuestion?.questionContent,
			questionNo: room.questionNo,
			questionTotal: room.questionTotal,
		};
	}
	isPlayerAnswered(roomId, socketId, questionId) {
		const room = rooms.find((room) => room.id === roomId);

		if (room) {
			const summary = room.summary.find(
				(summary) => summary.questionId === questionId
			);

			return summary?.detail.find((element) => element.playerId === socketId);
		}

		return false;
	}
	saveAnswer(roomId, socketId, questionId, answer) {
		let room = rooms.find((room) => room.id === roomId);

		if (room) {
			// Update player's answer
			let player = room.player.find((player) => player.id === socketId);
			if (player) {
				player.answer.push({
					questionId,
					answer,
				});
				player.total[answer]++;
			}

			// update room summary
			let summary = room.summary.find(
				(summary) => summary.questionId === questionId
			);
			if (summary) {
				summary.detail.push({
					playerId: socketId,
					playerName: player.name,
					answer,
				});
				summary[answer]++;
			}

			return { host: room.host.socketId, player: player.name, summary };
		}

		return false;
	}
	summary(roomId) {
		let room = rooms.find((room) => room.id === roomId);
		return room;
	}
	delete(roomId) {
		const index = rooms.findIndex((room) => room.id === roomId);
		if (index !== -1) rooms.splice(index, 1);
	}
}

export default new Room();
