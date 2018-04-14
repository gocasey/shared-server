const config = require('config');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const Logger = require('./utils/logger.js');
const filesRouter = require('./middlewares/routers/files_router.js');
const serversRouter = require('./middlewares/routers/servers_router.js');
const usersRouter = require('./middlewares/routers/users_router.js');
const ConnectionPoolFactory = require('./lib/factories/connection_pool_factory.js');
const errorMiddleware = require('./middlewares/error-middleware');

const logger = new Logger();
const postgrePool = new ConnectionPoolFactory(logger).createPool();


const app = express();

app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Add router to the API
filesRouter(app);
serversRouter(app);
usersRouter(app, logger, postgrePool);

// Add basic error middleware to handle all errors
app.use(errorMiddleware);

// Start the app in the designated port and host
app.listen(config.express.Port, config.express.Host, () => {
  console.log(`Shared Server running on http://${config.express.Host}:${config.express.Port}`);
});

module.exports = app;
