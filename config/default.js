const path = require('path');

const TEMP_FILES_DIRECTORY = path.join('temp', 'uploads');

module.exports = {
  'express': {
    'Host': process.env.HOST || '0.0.0.0',
    'Port': process.env.PORT || 8080,
  },
  'TEMP_FILES_DIRECTORY': TEMP_FILES_DIRECTORY,
};
