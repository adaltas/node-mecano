// Generated by CoffeeScript 2.5.1
// # `nikita.db.database.wait`

// Wait for the creation of a database.

// ## Create Database example

// ```js
// const {status} = await nikita.db.wait({
//   admin_username: 'test',
//   admin_password: 'test',
//   database: 'my_db'
// })
// console.info(`Did database existed initially: ${!status}`);
// ```

// ## Schema
var cmd, handler, schema;

schema = {
  type: 'object',
  properties: {
    'admin_username': {
      $ref: 'module://@nikitajs/db/src/query#/properties/admin_username'
    },
    'admin_password': {
      $ref: 'module://@nikitajs/db/src/query#/properties/admin_password'
    },
    'database': {
      type: 'string',
      description: `The database name to wait for.`
    },
    'engine': {
      $ref: 'module://@nikitajs/db/src/query#/properties/engine'
    },
    'host': {
      $ref: 'module://@nikitajs/db/src/query#/properties/host'
    },
    'port': {
      $ref: 'module://@nikitajs/db/src/query#/properties/port'
    }
  },
  required: ['admin_username', 'admin_password', 'database', 'engine', 'host']
};

// ## Handler
handler = function({
    config,
    metadata,
    tools: {find}
  }) {
  // Command
  return this.execute.wait({
    cmd: (function() {
      switch (config.engine) {
        case 'mariadb':
        case 'mysql':
          return cmd(config, {
            database: null
          }, "show databases") + ` | grep '${config.database}'`;
        case 'postgresql':
          return cmd(config, {
            database: null
          }, null) + ` -l | cut -d \\| -f 1 | grep -qw '${config.database}'`;
      }
    })()
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_name: 'database',
    global: 'db'
  },
  schema: schema
};

// ## Dependencies
({cmd} = require('../query'));
