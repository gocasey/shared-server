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
  app_owner varchar(100) REFERENCES servers(server_name) ON UPDATE CASCADE
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

client.connect();

const cleanupQueries = [serversTokensTableCleanupQuery, usersTokensTableCleanupQuery, usersTableCleanupQuery, serversTableCleanupQuery];
const creationQueries = [serversTableCreationQuery, usersTableCreationQuery, usersTokensTableCreationQuery, serversTokensTableCreationQuery];
const queriesToRun = cleanupQueries.concat(creationQueries);

runQueries();

async function runQueries(){
  for (let index = 0; index < queriesToRun.length; index++) {
    try {
      let res = await client.query(queriesToRun[index]);
      console.log('Query executed successfully: %j', res);
    }
    catch (err) {
      console.log('Error executing query: %j', err);
    }
  }
  client.end();
}
