let rooms = [];

class TempRoom {
	start(roomId) {
		const room = rooms.find((room) => room.id === roomId);
		if (!room) {
			rooms.push({
				id: roomId,
				player: [],
			});
		}
	}
	isPlayerJoined(roomId) {
		const room = rooms.find((room) => room.id === roomId);
		return room?.player;
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
		for (let index = 0; index < rooms.length; index++) {
			let playerIndex = rooms[index].player.find(
				(player) => player.id === socketId
			);

			if (playerIndex !== -1) {
				rooms[index].player.splice(playerIndex, 1);
				break;
			}
		}
	}
	delete(roomId) {
		const index = rooms.findIndex((room) => room.id === roomId);
		if (index !== -1) rooms.splice(index, 1);
	}
}

export default new TempRoom();
