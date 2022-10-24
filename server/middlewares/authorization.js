// models
import UserModel from '../models/User.js';

export const isAdmin = async (req, res, next) => {
	try {
		// this function need follow decode in jwt because it need user info to check permission
		if (!req.user) return res
			.status(403)
			.json({ success: false, message: 'Access is denied' });

		let user = await UserModel.findOne({ '_id': req.user.userId })

		// returns next() if the member exists and it is of type admin
		if (user && user.type != 'admin') return res
			.status(403)
			.json({ success: false, message: 'Access is denied' });

		return next();
	} catch (error) {
		return res.status(401).json({ success: false, message: error.message });
	}
};
