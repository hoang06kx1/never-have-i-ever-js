let players = [];

class Player {
	init(socketId, name) {
		const player = {
			id: socketId,
			name: name,
			answer: [],
			total: {
				yes: 0,
				no: 0,
			},
		};

		players.push(player);
		return player;
	}
}

export default new Player();
