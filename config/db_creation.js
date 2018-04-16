const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://pqjyeqaijafusn:e98fa09f1a4e049674037a98dc4c1f3a956702400f306f9395a280923f38d7c0' +
  '@ec2-54-163-240-54.compute-1.amazonaws.com:5432/dbhchlmki72u4a?ssl=true';
const client = new pg.Client({
  connectionString: connectionString,
});
const usersTableCreationQuery = `CREATE TABLE users (
  user_id serial PRIMARY KEY,
  username varchar (100) UNIQUE NOT NULL,
  password varchar (100) NOT NULL,
  token varchar(500)
);`

client.connect();

client.query(usersTableCreationQuery, function(err, res){
  if (err){
    console.log('Error creating table: %j', err);
  }
  else{
    console.log('Table created successfully: %j', res);
  }
  client.end();
});
