import http from 'http';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import { Server } from 'socket.io';
// import dotenv from 'dotenv';
import path from 'path';
// mongo connection
import './config/mongo.js';
// routes
import indexRouter from './routes/index.js';
import userRouter from './routes/user.js';
import roomRouter from './routes/room.js';
import categoriesRouter from './routes/categories.js';
import favoriteQuestionsRouter from './routes/favoriteQuestions.js';

// middlewares
import { decode } from './middlewares/jwt.js';
import WebSockets from './utils/WebSockets.js';

const app = express();
// const process = dotenv.config().parsed;
const __dirname = path.resolve();

/** Get port from environment and store in Express. */
// const port = process.PORT || '3000';
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/categories', categoriesRouter);
app.use('/rooms', roomRouter);
app.use('/favorite-questions', favoriteQuestionsRouter);
app.use('/.well-known/assetlinks.json', express.static(__dirname + '/assetlinks.json'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
	return res.status(404).json({
		success: false,
		message: 'API endpoint doesnt exist',
	});
});
/** Create HTTP server. */
const server = http.createServer(app);
/** Create socket connection */
global.io = new Server(server);
global.io.on('connection', WebSockets.connection);
/** Listen on provided port, on all network interfaces. */
server.listen(PORT);
/** Event listener for HTTP server "listening" event. */
server.on('listening', () => {
	console.log(`Listening on port (if localhost):: http://localhost:${PORT}/`);
});
