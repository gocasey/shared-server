const pg = require('pg');
const config = require('config');

const client = new pg.Client({
  connectionString: config.DATABASE_URL,
});

const serversTokensTableCleanupQuery = `DROP TABLE IF EXISTS servers_tokens;`;
const usersTokensTableCleanupQuery = `DROP TABLE IF EXISTS users_tokens;`;
const usersOwnershipTableCleanupQuery = `DROP TABLE IF EXISTS users_ownership;`;
const usersTableCleanupQuery = `DROP TABLE IF EXISTS users CASCADE;`;
const serversTableCleanupQuery = `DROP TABLE IF EXISTS servers CASCADE;`;
const filesTableCleanupQuery = `DROP TABLE IF EXISTS files CASCADE;`;

const createTimestampFunction = `CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_time = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`

const usersTableCreationQuery = `CREATE TABLE users (
  user_id serial PRIMARY KEY,
  username varchar(100) UNIQUE NOT NULL,
  password varchar(100) NOT NULL,
  last_connection timestamp,
  _rev varchar(500)
);`

const serversTableCreationQuery = `CREATE TABLE servers (
  server_id serial PRIMARY KEY,
  server_name varchar(100) UNIQUE NOT NULL,
  _rev varchar(500),
  created_by integer REFERENCES users,
  created_time timestamp NOT NULL DEFAULT NOW(),
  updated_time timestamp NOT NULL DEFAULT NOW(),
  last_connection timestamp,
  url varchar(500),
  is_active BOOLEAN DEFAULT TRUE
);`

const usersOwnershipCreationQuery = `CREATE TABLE users_ownership (
  id serial PRIMARY KEY,
  user_id integer UNIQUE REFERENCES users,
  server_id integer REFERENCES servers
);`

const usersTokensTableCreationQuery = `CREATE TABLE users_tokens (
  token_id serial PRIMARY KEY,
  token varchar(500),
  user_id integer UNIQUE REFERENCES users
);`

const serversTokensTableCreationQuery = `CREATE TABLE servers_tokens (
  token_id serial PRIMARY KEY,
  token varchar(500),
  server_id integer UNIQUE REFERENCES servers,
  is_active BOOLEAN DEFAULT TRUE
);`

const filesTableCreationQuery = `CREATE TABLE files (
  file_id serial PRIMARY KEY,
  _rev varchar(500),
  created_time timestamp NOT NULL DEFAULT NOW(),
  updated_time timestamp NOT NULL DEFAULT NOW(),
  size bigint,
  file_name varchar(200),
  resource varchar(500),
  owner integer REFERENCES servers,
  is_active BOOLEAN DEFAULT TRUE
);`

const filesUpdateTimeTrigger = `CREATE TRIGGER set_timestamp
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();`

const serversUpdateTimeTrigger = `CREATE TRIGGER set_timestamp
BEFORE UPDATE ON servers
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();`

const cleanupQueries = [serversTokensTableCleanupQuery, usersTokensTableCleanupQuery, usersOwnershipTableCleanupQuery,
                        usersTableCleanupQuery, serversTableCleanupQuery, filesTableCleanupQuery];
const creationQueries = [ createTimestampFunction, usersTableCreationQuery, serversTableCreationQuery, usersOwnershipCreationQuery, usersTokensTableCreationQuery,
                          serversTokensTableCreationQuery, filesTableCreationQuery, filesUpdateTimeTrigger, serversUpdateTimeTrigger];
const queriesToRun = cleanupQueries.concat(creationQueries);

runQueries();

async function runQueries(){
  await client.connect();
  for (let index = 0; index < queriesToRun.length; index++) {
    try {
      let res = await client.query(queriesToRun[index]);
      console.log('Query executed successfully: %j', res);
    }
    catch (err) {
      console.log('Error executing query: %j', err);
    }
  }
  await client.end();
}
