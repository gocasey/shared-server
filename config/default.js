const path = require('path');

const TEST_CONNECTION_STRING = 'postgres://yusljvwqussbar:647cdcdf697bda752502ffa78fc0d5867e07853eafa94b0994447d9d1bde0c29' +
  '@ec2-107-21-126-193.compute-1.amazonaws.com:5432/d4q17ui1v7hvto?ssl=true';
const PRODUCTION_CONNECTION_STRING = 'postgres://pqjyeqaijafusn:e98fa09f1a4e049674037a98dc4c1f3a956702400f306f9395a280923f38d7c0' +
  '@ec2-54-163-240-54.compute-1.amazonaws.com:5432/dbhchlmki72u4a?ssl=true';

function getDatabaseUrl(){
  let env = process.env.NODE_ENV;
  console.log('In %s environment, using %s database.', env, env);
  return (env === 'production') ? PRODUCTION_CONNECTION_STRING : TEST_CONNECTION_STRING;
}

module.exports = {
  'express': {
    'Host': process.env.HOST || '0.0.0.0',
    'Port': process.env.PORT || 8080,
  },
  'TEMP_FILES_DIRECTORY': path.join('temp', 'uploads'),
  'DATABASE_URL': getDatabaseUrl(),
};
