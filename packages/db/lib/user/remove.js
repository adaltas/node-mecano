// Generated by CoffeeScript 2.4.1
// # `nikita.db.user.remove`

// Create a user for the destination database.

// ## Options

// * `admin_username`   
//   The login of the database administrator.   
// * `admin_password`   
//   The password of the database administrator.   
// * `engine`   
//   The engine type, can be MySQL or PostgreSQL, default to MySQL.   
// * `host`   
//   The hostname of the database.   
// * `username`   
//   The new user name.   

// ## Source Code
var cmd;

module.exports = function({metadata, options}) {
  var k, ref, v;
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
  if (options.username == null) {
    options.username = metadata.argument;
  }
  return this.system.execute({
    cmd: cmd(options, `DROP USER IF EXISTS ${options.username};`)
  });
};

// ## Dependencies
({cmd} = require('../query'));
