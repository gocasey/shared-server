const pg = require('pg');
const config = require('config');

const client = new pg.Client({
  connectionString: config.DATABASE_URL,
});

const cleanupQuery = `TRUNCATE servers, users, files, servers_tokens, users_tokens, users_ownership;`

async function cleanupTables() {
  await client.connect();
  try {
    await client.query(cleanupQuery);
  }
  catch(err){
    console.error(err);
  }
  await client.end();
}

module.exports = cleanupTables;
