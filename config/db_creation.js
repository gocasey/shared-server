const async = require('async');
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://pqjyeqaijafusn:e98fa09f1a4e049674037a98dc4c1f3a956702400f306f9395a280923f38d7c0' +
  '@ec2-54-163-240-54.compute-1.amazonaws.com:5432/dbhchlmki72u4a?ssl=true';
const client = new pg.Client({
  connectionString: connectionString,
});

const serversTokensTableCleanupQuery = `DROP TABLE IF EXISTS servers_tokens;`;
const usersTokensTableCleanupQuery = `DROP TABLE IF EXISTS users_tokens;`;
const usersTableCleanupQuery = `DROP TABLE IF EXISTS users;`;
const serversTableCleanupQuery = `DROP TABLE IF EXISTS servers;`;
const filesTableCleanupQuery = `DROP TABLE IF EXISTS files;`;

const createTimestampFunction = `CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_time = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`

const serversTableCreationQuery = `CREATE TABLE servers (
  server_id serial PRIMARY KEY,
  server_name varchar(100) UNIQUE NOT NULL,
  _rev varchar(500)
);`

const usersTableCreationQuery = `CREATE TABLE users (
  user_id serial PRIMARY KEY,
  username varchar(100) UNIQUE NOT NULL,
  password varchar(100) NOT NULL,
  _rev varchar(500),
  app_owner varchar(100) REFERENCES servers(server_name)
);`

const usersTokensTableCreationQuery = `CREATE TABLE users_tokens (
  token_id serial PRIMARY KEY,
  token varchar(500),
  user_id integer UNIQUE REFERENCES users
);`

const serversTokensTableCreationQuery = `CREATE TABLE servers_tokens (
  token_id serial PRIMARY KEY,
  token varchar(500),
  server_id integer UNIQUE REFERENCES servers
);`

const filesTableCreationQuery = `CREATE TABLE files (
  file_id serial PRIMARY KEY,
  _rev varchar(500),
  created_time timestamp NOT NULL DEFAULT NOW(),
  updated_time timestamp NOT NULL DEFAULT NOW(),
  size bigint,
  file_name varchar(200),
  resource varchar(500)
);`

const filesTimestampTrigger = `CREATE TRIGGER set_timestamp
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();`

client.connect();

const cleanupQueries = [serversTokensTableCleanupQuery, usersTokensTableCleanupQuery, usersTableCleanupQuery, serversTableCleanupQuery, filesTableCleanupQuery];
const creationQueries = [createTimestampFunction, serversTableCreationQuery, usersTableCreationQuery, usersTokensTableCreationQuery, serversTokensTableCreationQuery, filesTableCreationQuery, filesTimestampTrigger];
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

