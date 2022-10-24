import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
// models
import UserModel from '../models/User.js';
import TokenInvalidModel from '../models/TokenInvalid.js';

const tokenKey = dotenv.config().parsed.TOKEN_KEY;

export const encode = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		// Validate if user exist in our database
		const user = await UserModel.findOne({ username });

		// verify login information
		if (user && (await bcrypt.compare(password, user.password))) {
			// prepare data to create token
			const payload = {
				userId: user._id,
				username: username,
			};

			const signOptions = {
				expiresIn: '8h',
			};

			// create access token
			const accessToken = jwt.sign(payload, tokenKey, signOptions);

			req.accessToken = accessToken;

			next();
		} else {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid Credentials' });
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error.error });
	}
};

export const decode = async (req, res, next) => {
	// validate if token exist in header
	if (!req.headers['authorization']) {
		return res
			.status(400)
			.json({ success: false, message: 'No access token provided' });
	}

	// exclude prefix
	const accessToken = req.headers.authorization.split(' ')[1];

	try {
		// token is invalid because logged out
		let tokenInvalid = await TokenInvalidModel.findOne({ token: accessToken });
		if (tokenInvalid) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid token' });
		}

		// validate token, return member information if valid
		const decoded = jwt.verify(accessToken, tokenKey);
		req.user = decoded;

		return next();
	} catch (error) {
		return res.status(401).json({ success: false, message: error.message });
	}
};

export const getUser = async (req, res, next) => {
	// this function is used to get user information with APIs that do not require authentication
	// continue if the access token is not found in the header
	if (!req.headers['authorization']) {
		return next()
	}

	const accessToken = req.headers.authorization.split(' ')[1]

	try {
		// continue if the access token is invalid because logged out
		let tokenInvalid = await TokenInvalidModel.findOne({ token: accessToken })
		if (tokenInvalid) {
			return next()
		}

		// validate token, return member information if valid
		const decoded = jwt.verify(accessToken, tokenKey)
		req.user = decoded

		return next()
	} catch (error) {
		return next()
	}
};
