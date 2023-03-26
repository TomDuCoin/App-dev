const express = require('express');
const createError = require('http-errors');
const { parseToken, checkUserSignedIn } = require('./middleware');
const { connectDb, MONGO_VALIDATION_ERR } = require('./../bin/dbConnection');
const MUUID = require('uuid-mongodb');

const router = express.Router();

router.use(parseToken);

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

router.route('/')
    .post(async(req, res, next) => {
        const usersColl = res.locals.usersColl;
        let userInfo = req.body;
        let userId = null;

        if (userInfo === undefined) {
            return next(createError(400, 'Request body is empty\n'));
        }

        userInfo['_id'] = MUUID.from(userInfo['_id']);
        userId = userInfo['_id'];
        if (await usersColl.findOne({ _id: userId }) !== null) {
            return next(createError(403, 'User already registered, please login.\n'));
        }
        try {
            await usersColl.insertOne({...userInfo, 'oauthCredentials': {}, 'dashboards': [] });
            res.json(userInfo);
        } catch (dbError) {
            console.error("Failed to validate db schema");
            if (dbError.hasOwnProperty('code') && dbError.code === MONGO_VALIDATION_ERR) {
                return next(createError(400, 'Could not complete request, incorrect user info schema\n'));
            }
        }
    })
    .get(async(req, res, next) => {
        const usersColl = res.locals.usersColl;
        const userId = req.query['login'];
        const [mail, pass] = res.locals.credentials;
        let userInfo = null;
        let errMsg401 = null;

		console.log(res.locals.credentials);
        if (userId === undefined) {
            errMsg401 = 'User needs to login first\n';
        } else {
            userInfo = await usersColl.findOne({ _id: MUUID.from(userId) });
			console.log(userInfo);
			console.log(pass);
            if (userInfo === null) {
                return next(createError(404, 'User needs to create an account first\n'));
            } else if (userInfo['pwd'] !== pass) {
                errMsg401 = 'Password incorrect\n';
            } else if (userInfo['mail'] !== mail) {
                errMsg401 = 'Mail incorrect\n';
            }
        }
        if (errMsg401 !== null) {
            res.set('WWW-Authenticate', 'Basic');
            return next(createError(401, errMsg401));
        }
        if (userInfo !== null) {
            delete userInfo.pass;
        }
        res.json(userInfo);
    });

module.exports = router;