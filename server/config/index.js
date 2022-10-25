import dotenv from 'dotenv';

const process = dotenv.config().parsed;
const config = {
	db: {
		// url: `${process.MONGO_HOST}:${process.MONGO_PORT}`, // MongoDB local
		// url: `${process.MONGO_CLUSTER_URL}`, // Mongo Atlas
		// name: `${process.MONGO_DB}`,
		// username: `${process.MONGO_USERNAME}`,
		// password: `${process.MONGO_PASSWORD}`,
		url: `cluster0.tfu83xi.mongodb.net`, // Mongo Atlas
		name: `never-have-ever`,
		username: `admin`,
		password: `nfq2022`,
	},
};

export default config;
