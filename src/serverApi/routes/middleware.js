"use strict";
const createError = require('http-errors');
const { connectDb } = require('./../bin/dbConnection');
const MUUID = require('uuid-mongodb');

function parseToken(req, res, next) {
  let basicAuthToken = null;

  if (req.get("Authorization") === undefined) {
    return next(createError(401, "Authorization header missing\n"));
  }
  basicAuthToken = req.get("Authorization").match(/(?<=Basic ).*/);
  if (basicAuthToken === null) {
    return next(createError(401, "Authorization header empty\n"));
  }
  res.locals.credentials = Buffer.from(basicAuthToken[0], 'base64')
                                 .toString()
                                 .split(':');
  next();
}

async function checkUserSignedIn(req, res, next) {
  try {
    const [ mail, pass ] = res.locals.credentials;
    const db = await connectDb();
    if (await db.collection('users').findOne({pwd: pass, mail: mail}) === null) {
      return next(createError(401
                , "Incorrect mail or password\n"
                , {headers: {'WWW-Authenticate': "Basic"}}));
    }
    next();
  } catch(err) {
    console.error(err);
    return next(createError(500, err));
  }
}

async function checkUUID(req, res, next) {
  try {
    let userId = req.get('X-User-ID');
    let usersColl = res.locals.usersColl;

    if (userId === undefined) {
      next(createError(401, "Missing X-User-ID header\n"));
    }
    userId = MUUID.from(userId);
    if (await usersColl.findOne({_id: userId}) === null) {
      next(createError(401, "Cannot find user\n"));
    }
    res.locals.userId = userId;
    next();
  } catch(err) {
    next(createError(500, err));
  }
}

module.exports = {parseToken, checkUserSignedIn, checkUUID}