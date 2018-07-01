require('dotenv').config();
const config = require('config');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const Logger = require('./utils/logger.js');
const filesRouter = require('./middlewares/routers/files_router.js');
const serversRouter = require('./middlewares/routers/servers_router.js');
const usersRouter = require('./middlewares/routers/users_router.js');
const statsRouter = require('./middlewares/routers/stats_router.js');
const ConnectionPoolFactory = require('./lib/factories/connection_pool_factory.js');
const errorMiddleware = require('./middlewares/main_error_handler.js');

const logger = new Logger();
const postgrePool = new ConnectionPoolFactory(logger).createPool();

const app = express();

app.use(bodyParser.json({ limit: '20mb' }));

// Enable CORS for all routes
app.use(cors());

// Add routers to the API
filesRouter(app, logger, postgrePool);
serversRouter(app, logger, postgrePool);
usersRouter(app, logger, postgrePool);
statsRouter(app, logger, postgrePool);

// Add basic error middleware to handle all errors
errorMiddleware(app, logger);

// Start the app in the designated port and host

if (! module.parent) {
  app.listen(config.express.Port, config.express.Host, () => {
    console.log(`Shared Server running on http://${config.express.Host}:${config.express.Port}`);
  });
}

module.exports = app;
