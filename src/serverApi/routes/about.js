const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const ip = require('ip');
const { connectDb } = require('./../bin/dbConnection');

router.use(async (req, res, next) => {
	try {
		const db = await connectDb();
		res.locals.servicesColl = db.collection('services');
		next();
	} catch (err) {
		console.error(err);
		next(err);
	}
});

router.get('/', async (req, res) => {
	const servicesColl = res.locals.servicesColl;
	const services = await servicesColl.find().toArray();

	for (let i = 0; i < services.length; i++)
		delete services[i]['_id'];
	const about = {
		client: { host: ip.address()},
		server: {
			current_time: Math.floor(new Date() / 1000),
			services
		}
	}
	res.json(about);
});

module.exports = router;
