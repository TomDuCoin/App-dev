"use strict";
const express = require('express');
const createError = require('http-errors');
const HTTPErrors = require('http-errors');
const axios = require('axios');
const MUUID = require('uuid-mongodb');

const { parseToken, checkUserSignedIn, checkUUID } = require('./middleware');
const { connectDb } = require('./../bin/dbConnection');

const router = express.Router();

router.use(parseToken);
router.use(checkUserSignedIn);

router.use(async function openDbConnection(req, res, next) {
	try {
	  const db = await connectDb();
	  res.locals.servicesColl = db.collection('services');
	  res.locals.usersColl = db.collection('users');
	  next();
	} catch(err) {
	  console.error(err);
	  return next(createError(500, err));
	}
  });

router.get('/', async (req, res, next) => {
	try {
	  const servicesColl = res.locals.servicesColl;
	  const services = await servicesColl.find()
										 .toArray();
	  res.status(200)
		 .send({"services": services});
	} catch(err) {
	  console.error(err);
	  next(createError(500, err));
	}
  });

module.exports = router;