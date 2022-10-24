// utils
import makeValidation from '@withvoid/make-validation';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Joi from 'joi';
import sendEmail from '../utils/sendEmail.js';

// models
import UserModel from '../models/User.js';
import TokenModel from '../models/Token.js';
import TokenInvalidModel from '../models/TokenInvalid.js';
import FavoriteQuestionModel from '../models/FavoriteQuestion.js';
import RoomModel from '../models/Room.js';

export default {
	onUserGetInfo: async (req, res) => {
		try {
			// get user
			let user = await UserModel.findOne({ _id: req.user.userId }).select('-password');

			// count the members' favorite questions
			const favoriteQuestions = await FavoriteQuestionModel.findOne({ userId: user._id }).select('questions -_id');
			user._doc.favoriteQuestions = favoriteQuestions?.questions?.length ?? 0

			// count the number of rooms user have created
			const rooms = await RoomModel.count({userId: {$in: [user._id, req.query.deviceId]}});
			user._doc.roomCreated = rooms

			return res.status(201).json({ success: true, data: user });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}

	},
	onGetAllUsers: async (req, res) => {
		try {
			// get list users
			const users = await UserModel.find({});

			return res.status(201).json({ success: true, users });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onGetUserById: async (req, res) => {},
	onCreateUser: async (req, res) => {
		try {
			// validate request parameters
			const validation = makeValidation((types) => ({
				payload: req.body,
				checks: {
					username: { type: types.string },
					password: { type: types.string },
					email: { type: types.string },
				},
			}));

			if (!validation.success) return res.status(400).json(validation);

			const { username, password, email } = req.body;

			// Validate if username exist in our database
			const existUsername = await UserModel.findOne({ username });

			if (existUsername) {
				return res.status(409).json({
					success: false,
					message: "Kindly fix the error(s)",
					errors: {
						username: "Username already exist."
					}
				});
			}

			// hash password
			const encryptedPassword = await bcrypt.hash(password, 10);
			// create user
			const user = await UserModel.create({
				username,
				password: encryptedPassword,
				email
			});

			return res.status(201).json({ success: true, user });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onChangePassword: async (req, res) => {
		try {
			// validate request parameters
			const validation = makeValidation((types) => ({
				payload: req.body,
				checks: {
					password: { type: types.string },
					newPassword: { type: types.string },
					confirmPassword: { type: types.string },
				},
			}));

			if (!validation.success) return res.status(400).json(validation);

			const { password, newPassword, confirmPassword } = req.body;

			// make sure confirm password is correct
			if (newPassword !== confirmPassword) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					confirmPassword: "Password confirmation doesn't match the password"
				}
			});

			// validate if user exist in our database
			const user = await UserModel.findOne({ "_id": req.user.userId })
			if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					password: "Password isn't valid"
				}
			});

			// hash new password
			const encryptedPassword = await bcrypt.hash(newPassword, 10);
			// update user
			const data = await UserModel.findOneAndUpdate(
				{ _id: user._id },
				{ password: encryptedPassword }
			)

			return res.status(200).json({ success: true, data });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onResetPassword: async (req, res) => {
		try {
			// validate request parameters
			const schema = Joi.object({ email: Joi.string().email().required() })
			const { error } = schema.validate(req.body)
			if (error) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					email: error.details[0].message
				}
			});

			// validate if user exist in our database
			const user = await UserModel.findOne({ email: req.body.email })
			if (!user) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					user: "User with given email doesn't exist"
				}
			})

			// randomize new password and save to member
			const password = crypto.randomBytes(12).toString("hex")
			user.password = await bcrypt.hash(password, 10)
			user.save()

			// create email content
			let content = `Dear ${user.username},<br>
<br>
The password for your account has been successfully reset.<br>
<br>
This is your new password: <b>${password}</b><br>
<br>
If you need additional help, please contact Never Have I Ever Support.<br>
<br>
Sincerely,<br>
Never Have I Ever Support`;

			await sendEmail(user.email, "Your password has been reset", content)

			return res.status(200).json({
				success: true,
				message: "New Password sent to your email account",
			});
		} catch (error) {
			return res.status(500).json({ success: false, error: error })
		}
	},
	onResetPasswordUseLink: async (req, res) => {
		try {
			// validate request parameters
			const schema = Joi.object({ email: Joi.string().email().required() });
			const { error } = schema.validate(req.body);
			if (error) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					email: error.details[0].message
				}
			});

			// validate if user exist in our database
			const user = await UserModel.findOne({ email: req.body.email });
			if (!user) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					user: "User with given email doesn't exist"
				}
			});

			// generate token for authentication and save in database
			let token = await TokenModel.findOne({ userId: user._id });
			if (!token) {
				token = await new TokenModel({
					userId: user._id,
					token: crypto.randomBytes(32).toString("hex"),
				}).save();
			}

			// create password reset link with token and send to member
			const link = `${process.env.BASE_URL}/users/${user._id}/reset-password/${token.token}`;
			await sendEmail(user.email, "Password reset", link);

			return res.status(200).json({
				success: true,
				message: "Password reset link sent to your email account",
			});
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onResetPasswordToken: async (req, res) => {
		try {
			// validate request parameters
			const schema = Joi.object({ password: Joi.string().required() });
			const { error } = schema.validate(req.body);
			if (error) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					password: error.details[0].message
				}
			});

			const token = await TokenModel.findOne({
				userId: req.params.id,
				token: req.params.token,
			});

			// validate if token exist in our database
			if (!token) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					user: "Invalid link or expired"
				}
			});

			// validate if user exist in our database
			const user = await UserModel.findById(req.params.id);
			if (!user) return res.status(400).json({
				success: false,
				message: "Kindly fix the error(s)",
				errors: {
					user: "Invalid link or expired"
				}
			});

			// hash the password and save it to the member and disable token
			user.password = await bcrypt.hash(req.body.password, 10);
			await user.save();
			await token.delete();

			return res.status(200).json({
				success: true,
				message: "Password reset successfully.",
			});
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}
	},
	onUserLogout: async (req, res) => {
		try {
			// save the token to the database for the purpose of excluding it when validating
			const accessToken = req.headers.authorization.split(' ')[1];
			let token = await TokenInvalidModel.findOne({ token: accessToken });
			if (!token) {
				await new TokenInvalidModel({
					token: accessToken
				}).save();
			}

			return res.status(200).json({ success: true, message: 'Logout successfully' });
		} catch (error) {
			return res.status(500).json({ success: false, error: error });
		}

	},
};
