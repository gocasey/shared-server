const async = require('async');
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://pqjyeqaijafusn:e98fa09f1a4e049674037a98dc4c1f3a956702400f306f9395a280923f38d7c0' +
  '@ec2-54-163-240-54.compute-1.amazonaws.com:5432/dbhchlmki72u4a?ssl=true';
const client = new pg.Client({
  connectionString: connectionString,
});

const tokensTableCleanupQuery = `DROP TABLE IF EXISTS users_tokens;`;
const usersTableCleanupQuery = `DROP TABLE IF EXISTS users;`;

const usersTableCreationQuery = `CREATE TABLE users (
  user_id serial PRIMARY KEY,
  username varchar (100) UNIQUE NOT NULL,
  password varchar (100) NOT NULL
);`

const tokensTableCreationQuery = `CREATE TABLE users_tokens (
  token_id serial PRIMARY KEY,
  token varchar(500),
  user_id integer REFERENCES users
);`

client.connect();

const cleanupQueries = [tokensTableCleanupQuery, usersTableCleanupQuery ];
const creationQueries = [usersTableCreationQuery, tokensTableCreationQuery];
const queriesToRun = cleanupQueries.concat(creationQueries);

async.eachSeries(queriesToRun,
  function(query, callback) {
    client.query(query, function (err, res) {
      if (err) {
        console.log('Error executing query: %j', err);
        callback(err);
      }
      else {
        console.log('Query executed successfully: %j', res);
        callback();
      }
    });
  }, function(){
    client.end();
});
