const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan')
const usersRouter = require('./routes/users');
const dashboardsRouter = require('./routes/dashboards');
const oauthRouter = require('./routes/oauth');
const servicesRouter = require('./routes/services');
const aboutRouter = require('./routes/about');

const cors = require('cors');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'))
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/about.json', aboutRouter);
app.use('/services', servicesRouter);
app.use('/oauth', oauthRouter);
app.use('/users', usersRouter);
app.use('/dashboards', dashboardsRouter);

app.use(function(err, req, res, next) {
    console.error(`Loggin from top level, ${err.message}`);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.set(err.headers)
        .status(err.status || 500)
        .send(err.message);
});

app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
    console.log(`Server started: ${process.env.APP_HOST}:${process.env.APP_PORT}`);
});

module.exports = app;