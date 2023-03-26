"use strict";
const express = require('express');
const createError = require('http-errors');
const { parseToken, checkUserSignedIn, checkUUID} = require('./middleware');
const { connectDb, MONGO_VALIDATION_ERR } = require('./../bin/dbConnection');
const MUUID = require('uuid-mongodb');

const router = express.Router();

router.use(parseToken);
router.use(checkUserSignedIn);

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

router.use(checkUUID);

const widgetsUrls = {
	headlines: `https://newsapi.org/v2/top-headlines?q={subject}&apiKey=${process.env.NEWS_API_API_KEY}&pageSize={limit}`,
	trending: `https://api.giphy.com/v1/gifs/trending?api_key=${process.env.GIFY_API_KEY}&limit={limit}&rating=g`,
	APOD: `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&count={count}`,
	Rankings: 'https://api-formula-1.p.rapidapi.com/rankings/teams?season={season}'
}

function mapParamsToUrl(widgetName, widgetParams) {
	let widgetUrl = widgetsUrls[widgetName];

	for (let i = 0; i < widgetParams.length; i++) {
		widgetUrl = widgetUrl.replace(`{${widgetParams[i].name}}`, widgetParams[i].value);
	}
	return widgetUrl;
}

router.route('/:dashboardID/widgets/:widgetID')
	.put(async (req, res, next) => {
		const userId = res.locals.userId;
		const dashboardId = req.params['dashboardID'];
		const widgetId = req.params['widgetID'];
		const usersColl = res.locals.usersColl;

		if (userId === undefined)
			return next(createError(404, 'User needs to login first'));
		// Find the user document
		const user = await usersColl.findOne({ _id: MUUID.from(userId) });

		// Find the dashboard document
		const dashboard = user.dashboards.find(d => d._id == dashboardId);
		if (dashboard === undefined)
			return next(createError(404, 'dashboard id not found'));
		// Find the widget document
		let widget = dashboard.widgets.find(w => w._id == widgetId);
		if (widget === undefined)
			return next(createError(404, 'widget id not fount'));
		// Update the widget with new data
		widget = req.body;
		widget['_id'] = MUUID.from(widget['_id'])
		widget['url'] = mapParamsToUrl(widget.name, widget.params);

		// Save the updated widget document back to the dashboard
		try {
			await usersColl.updateOne(
			{
				_id: MUUID.from(userId),
				"dashboards._id": MUUID.from(dashboardId),
				"dashboards.widgets._id": MUUID.from(widgetId)
			  },
			  { $set: { "dashboards.$[dashboard].widgets.$[widget]": widget } },
			  {
				arrayFilters: [
				  { "dashboard._id": MUUID.from(dashboardId) },
				  { "widget._id": MUUID.from(widgetId) }
				]
			  },
			);
		} catch(error) {
			return next(createError(404, "missing body fields"))
		}
		res.status(200).send('widget successfully updated');
	})
	.delete(async (req, res, next) => {
		const userId = res.locals.userId;
		const dashboardId = req.params['dashboardID'];
		const widgetId = req.params['widgetID'];
		const usersColl = res.locals.usersColl;

		if (userId === undefined)
			return next(createError(404, 'User needs to login first'));
		// Find the user document
		const user = await usersColl.findOne({ _id: MUUID.from(userId) });

		// Find the dashboard document
		const dashboard = user.dashboards.find(d => d._id == dashboardId);
		if (dashboard === undefined)
			return next(createError(404, 'dashboard id not found'));
		// Find the widget document
		let widget = dashboard.widgets.find(w => w._id == widgetId);
		if (widget === undefined)
			return next(createError(404, 'widget id not fount'));
		await usersColl.updateOne(
			{ '_id': MUUID.from(userId), 'dashboards._id': MUUID.from(dashboardId)},
			{ $pull: { 'dashboards.$.widgets': {'_id': MUUID.from(req.params['widgetID'])}}}
			)
		res.status(200).send('data successfully deleted');
	})

router.route('/:dashboardID/widgets')
	.post(async (req, res, next) => {
		const usersColl = res.locals.usersColl;
		const userId = res.locals.userId;
		let widget = req.body;

		if (userId === undefined)
			return next(createError(404, 'User needs to login first\n'));
		if (widget['name'] === undefined)
			return next(createError(404, 'widget name not defined'));
		if (!(widget['name'] in widgetsUrls))
			return next(createError(404, 'widget name does not exist'));
		const newWidget = {
			_id: MUUID.v4(),
			name: widget['name'],
			description: widget['description'],
			params: widget['params'],
			timer: widget['timer'],
			url: mapParamsToUrl(widget['name'], widget['params'])
		}
		console.log(newWidget);
		try {
			await usersColl.updateOne(
				{_id: MUUID.from(userId), "dashboards._id": MUUID.from(req.params['dashboardID'])},
				{$push: {"dashboards.$.widgets": newWidget}},
				{upsert: true}
			);
		} catch(err) {
			return next(createError(404, 'dashboardID not found'));
		}
		res.json(newWidget);
	})

router.route('/:dashboardID')
	.delete(async (req, res, next) => {
		const usersColl = res.locals.usersColl;
		const userId = res.locals.userId;

		if (userId === undefined)
			return next(createError(404, 'User needs to login first\n'));
		const userDashboards = (await usersColl.findOne({'_id': MUUID.from(userId)}))['dashboards'];
		const selectedDashboard = userDashboards.filter(dashboard => dashboard._id == req.params['dashboardID'])
		if (selectedDashboard.length < 1)
			return next(createError(404, 'dashboard id not found'));
		await usersColl.updateOne(
			{ '_id': MUUID.from(userId) },
			{ $pull: { 'dashboards': { '_id': MUUID.from(req.params['dashboardID'])}}}
			)
		res.status(200).send('data successfully deleted');
	})
	.put(async (req, res, next) => {
		const usersColl = res.locals.usersColl;
		const userId = res.locals.userId;
		let dashboardModifications = req.body;

		if (userId === undefined)
			return next(createError(401, 'User needs to login first\n'));
		const userDashboards = (await usersColl.findOne({'_id': MUUID.from(userId)}))['dashboards'];
		const selectedDashboard = userDashboards.filter(dashboard => dashboard._id == req.params['dashboardID'])
		if (selectedDashboard.length < 1)
			return next(createError(404, 'dashboard id not found'));
		const pre = 'dashboards.$.';
		dashboardModifications = Object.keys(dashboardModifications).reduce((a, c) => (a[`${pre}${c}`] = dashboardModifications[c], a), {});
		const update = await usersColl.findOneAndUpdate(
			{'_id': MUUID.from(userId), 'dashboards._id': MUUID.from(req.params['dashboardID'])},
			{$set: dashboardModifications});
		res.status(200).send('data successfully modified')
	})

router.route('/')
  .post(async (req, res, next) => {
    const usersColl = res.locals.usersColl;
    const dashboardInfo = req.body;
	const userId = res.locals.userId;


	if (dashboardInfo === undefined) {
      return next(createError(400, 'Request body is empty\n'));
    }

	try {
		const updateQuery = {$push: {}};
		const newDashboard = {
			_id: MUUID.v4(),
			title: dashboardInfo['title'],
			description: dashboardInfo['description'],
			widgets: []
		};

		updateQuery.$push['dashboards'] = newDashboard;

		await usersColl.updateOne({'_id': MUUID.from(userId)}, updateQuery, {upsert: true});
      	res.json(newDashboard);
    } catch (dbError) {
     	console.error("Failed to validate db schema");
    	return next(createError(400, 'Could not complete request, incorrect user info schema\n'));
    }
  })
  .get(async (req, res, next) => {
	const usersColl = res.locals.usersColl;
	const userId = res.locals.userId;

	if (userId === undefined)
		return next(createError(404, 'User needs to login first\n'));

	const userDashboards = await usersColl.findOne({'_id': MUUID.from(userId)});
	res.json(userDashboards['dashboards']);
  })



module.exports = router;
