// Generated by CoffeeScript 2.4.1
// # `nikita.db.database.remove`

// Create a user for the destination database.

// ## Options

// * `admin_username`   
//   The login of the database administrator.   
// * `admin_password`   
//   The password of the database administrator.   
// * `engine`   
//   The engine type, can be MySQL or PostgreSQL. Default to MySQL   
// * `host`   
//   The hostname of the database   
// * `database`   
//   The database to be removed.   

// ## Source Code
var cmd;

module.exports = function({metadata, options}) {
  var database, k, ref, v;
  // Import options from `options.db`
  if (options.db == null) {
    options.db = {};
  }
  ref = options.db;
  for (k in ref) {
    v = ref[k];
    if (options[k] == null) {
      options[k] = v;
    }
  }
  if (options.database == null) {
    options.database = metadata.argument;
  }
  if (!options.admin_username) {
    throw Error('Missing option: "admin_username"');
  }
  if (!options.admin_password) {
    throw Error('Missing option: "admin_password"');
  }
  // Avoid Postgres error "ERROR:  cannot drop the currently open database"
  database = options.database;
  delete options.database;
  return this.system.execute({
    cmd: cmd(options, `DROP DATABASE IF EXISTS ${database};`),
    code_skipped: 2
  });
};

// ## Dependencies
({cmd} = require('../query'));
