// Generated by CoffeeScript 2.4.1
// # `nikita.db.schema.remove`

// Create a user for the destination database.

// ## Options

// * `admin_username`   
//   The login of the database administrator. It should have credentials to 
//   create accounts.   
// * `admin_password`   
//   The password of the database administrator.   
// * `engine`   
//   The engine type, can be MySQL or PostgreSQL, default to MySQL.   
// * `host`   
//   The hostname of the database.   
// * `schema`   
//   New schema name.   

// ## Source Code
var cmd;

module.exports = function({metadata, options}) {
  var k, ref, ref1, v;
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
  // Options
  if (options.schema == null) {
    options.schema = metadata.argument;
  }
  if (!options.engine) {
    throw Error('Missing option: "engine"');
  }
  if (!options.schema) {
    throw Error('Missing option: "schema"');
  }
  if (!options.admin_username) {
    throw Error('Missing option: "admin_username"');
  }
  if (!options.admin_password) {
    throw Error('Missing option: "admin_password"');
  }
  // Deprecation
  if (options.engine === 'postgres') {
    console.error('Deprecated Value: options "postgres" is deprecated in favor of "postgresql"');
    options.engine = 'postgresql';
  }
  // Defines and check the engine type
  options.engine = options.engine.toLowerCase();
  if ((ref1 = options.engine) !== 'postgresql') {
    throw Error(`Unsupport engine: ${JSON.stringify(options.engine)}`);
  }
  return this.system.execute({
    cmd: cmd(options, `DROP SCHEMA IF EXISTS ${options.schema};`)
  });
};

// ## Dependencies
({cmd} = require('../query'));
