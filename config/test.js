module.exports = {
  'express': {
    'Host': process.env.HOST || '0.0.0.0',
    'Port': process.env.PORT || 8080,
  },
  'GOOGLE_CLOUD_PROJECT_ID': 'taller2-2018-1-grupo2',
  'GOOGLE_CLOUD_BUCKET_NAME': 'staging.taller2-2018-1-grupo2.appspot.com',
  'FILES_DIRECTORY': 'uploads',
  'APP_SERVER_ENDPOINT_FOR_STORIES_STATS': '/api/v1/stats/stories',
  'APP_SERVER_ENDPOINT_FOR_REQUESTS_STATS': '/api/v1/stats/last/',
  'DATABASE_URL': 'postgres://yusljvwqussbar:647cdcdf697bda752502ffa78fc0d5867e07853eafa94b0994447d9d1bde0c29' +
  '@ec2-107-21-126-193.compute-1.amazonaws.com:5432/d4q17ui1v7hvto?ssl=true',
};
