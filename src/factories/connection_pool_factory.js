var Pool = require('pg');

function ConnectionPoolFactory() {
    var _self = this;

    _self.createPool = function () {
        var pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'users',
            password: 'admin',
            port: 5432,
        });
        return pool;
    };
}

module.exports = ConnectionPoolFactory;
