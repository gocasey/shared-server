module.exports = {
  'express': {
    'Host': process.env.HOST || '0.0.0.0',
    'Port': process.env.PORT || 8080,
  },
  'GOOGLE_CLOUD_PROJECT_ID': 'taller2-2018-1-grupo2',
  'GOOGLE_CLOUD_BUCKET_NAME': 'taller2-2018-1-grupo2.appspot.com',
  'FILES_DIRECTORY': 'uploads',
  'APP_SERVER_ENDPOINT_FOR_STORIES_STATS': '/api/v1/stats/stories',
  'APP_SERVER_ENDPOINT_FOR_REQUESTS_STATS': '/api/v1/stats/last/',
  'DATABASE_URL': 'postgres://pqjyeqaijafusn:e98fa09f1a4e049674037a98dc4c1f3a956702400f306f9395a280923f38d7c0' +
'@ec2-54-163-240-54.compute-1.amazonaws.com:5432/dbhchlmki72u4a?ssl=true',
};
