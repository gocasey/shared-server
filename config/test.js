const path = require('path');

module.exports = {
  'express': {
    'Host': process.env.HOST || '0.0.0.0',
    'Port': process.env.PORT || 8080,
  },
  'TEMP_FILES_DIRECTORY': path.join('temp', 'uploads'),
  'APP_SERVER_ENDPOINT_FOR_STORIES_STATS': '/api/v1/stats/stories',
  'APP_SERVER_ENDPOINT_FOR_REQUESTS_STATS': '/api/v1/stats/last/',
  'DATABASE_URL': 'postgres://yusljvwqussbar:647cdcdf697bda752502ffa78fc0d5867e07853eafa94b0994447d9d1bde0c29' +
  '@ec2-107-21-126-193.compute-1.amazonaws.com:5432/d4q17ui1v7hvto?ssl=true',
};
