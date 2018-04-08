const config = require('config');
const cors = require('cors');
const express = require('express');
const apiRouter = require('./router');
const errorMiddleware = require('./middlewares/error-middleware');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Add router to the API
app.use('/api', apiRouter(new express.Router()));

// Add basic error middleware to handle all errors
app.use(errorMiddleware);

// Start the app in the designated port and host
app.listen(config.express.Port, config.express.Host, () => {
  console.log(`Shared Server running on http://${config.express.Host}:${config.express.Port}`);
});

module.exports = app;
