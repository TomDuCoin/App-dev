"use strict";
const express = require('express');
const createError = require('http-errors');
const { connectDb, MONGO_VALIDATION_ERR } = require('./../bin/dbConnection');
const MUUID = require('uuid-mongodb');
const axios = require('axios');
const getUuid = require('uuid-by-string');
const encode = require('base-64');

const router = express.Router();

router.use(async (req, res, next) => {
	if (req.body['code'] === undefined) {
	  next(createError(400, 'AuthToken URL missing\n'));
	  return;
	}

	try {
	  const db = await connectDb();
	  res.locals.usersColl = db.collection('users');
	  next();
	} catch(err) {
	  console.error(err);
	  next(err);
	}
  });

router.use(async function openDbConnection(req, res, next) {
  try {
    const db = await connectDb();
    res.locals.usersColl = db.collection('users');
    next();
  } catch (err) {
    console.error(err);
   return next(createError(500, err));
  }
});

router.route('/google')
  .post(async (req, res, next) => {
	const reqBody = req.body;
	let resp;
	let userInfo;

	try {
		resp = await axios.post('https://oauth2.googleapis.com/token',
			{
				client_id: "768406115980-qjdk8o738cfui43s3lggdmg17mf5pj7f.apps.googleusercontent.com",
				client_secret: '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',
				code: req.body['code'],
				grant_type: 'authorization_code',
				redirect_uri: `${process.env.CLIENT_URL}/redirect_oauth`
			},
			{headers: {'content-type': 'application/x-www-form-urlencoded'}}
			);
	} catch(err) {
		return next(createError(500, err));
	}
	try {
		userInfo = await axios.get(
			`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${resp.data.access_token}`
		);
	} catch(err) {
		return next(500, err);
	}
	const id = getUuid(userInfo.data.email);
	const json = JSON.stringify({_id: id, name: userInfo.data.name, mail: userInfo.data.email, pwd: '1234567890'})
	const creds = encode.encode(`${userInfo.data.email}:1234567890`);
	try {
		await axios.post('http://localhost:8080/users',
		json,
		{
			headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${creds}`},
		}
		);
	} catch (err) {
		if (!err?.response) {
			return next(500, 'server error');
		} else if (err.response?.status === 400) {
			return next(400, 'missing information field');
		} else if (err.response?.status === 401) {
			return next(401, 'Unauthorized');
		}
	}
	res.json({_id: id, name: userInfo.data.name, creds: creds})
  })

module.exports = router;