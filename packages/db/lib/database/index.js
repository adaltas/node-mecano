// Generated by CoffeeScript 2.5.1
// # `nikita.db.database`

// Create a database inside the destination datababse server.

// ## Create database example

// ```js
// const {status} = await nikita.database.db({
//   admin_username: 'test',
//   admin_password: 'test',
//   database: 'my_db',
// })
// console.info(`Database created or modified: ${status}`)
// ```

// ## Schema
var cmd, connection_config, handler, schema;

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
      description: `The name of the database to create.`
    },
    'user': {
      oneOf: [
        {
          type: 'string'
        },
        {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      ],
      description: `This users who will be granted superuser permissions.`
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

// ## Source Code
handler = async function({
    config,
    tools: {log}
  }) {
  var cmd_database_create, cmd_grant_privileges, cmd_has_privileges, exists, i, len, ref, status, user;
  if (config.user == null) {
    config.user = [];
  }
  if (typeof config.user === 'string') {
    config.user = [config.user];
  }
  // Defines and check the engine type
  config.engine = config.engine.toLowerCase();
  log({
    message: `Database engine set to ${config.engine}`,
    level: 'DEBUG',
    module: 'nikita/db/database'
  });
  // Create database unless exist
  log({
    message: `Check if database ${config.database} exists`,
    level: 'DEBUG',
    module: 'nikita/db/database'
  });
  switch (config.engine) {
    case 'mariadb':
    case 'mysql':
      if (config.character_set == null) {
        config.character_set = 'latin1'; // MySQL default
      }
      switch (config.character_set) {
        case 'latin1':
          if (config.collation == null) {
            config.collation = 'latin1_swedish_ci'; // MySQL default
          }
          break;
        case 'utf8':
          if (config.collation == null) {
            config.collation = 'utf8_general_ci';
          }
      }
      cmd_database_create = cmd(config, {
        database: null
      }, [`CREATE DATABASE ${config.database}`, `DEFAULT CHARACTER SET ${config.character_set}`, config.collation ? `DEFAULT COLLATE ${config.collation}` : void 0, ';'].join(' '));
      break;
    case 'postgresql':
      cmd_database_create = cmd(config, {
        database: null
      }, `CREATE DATABASE ${config.database};`);
  }
  // Create the database if it does not exists
  ({exists} = (await this.db.database.exists(config)));
  if (!exists) {
    await this.execute({
      cmd: cmd_database_create
    });
    log({
      message: `Database created: ${JSON.stringify(config.database)}`,
      level: 'WARN',
      module: 'nikita/db/database'
    });
  }
  ref = config.user;
  // Associate users to the database
  for (i = 0, len = ref.length; i < len; i++) {
    user = ref[i];
    log({
      message: `Check if user ${user} has PRIVILEGES on ${config.database} `,
      level: 'DEBUG',
      module: 'nikita/db/database'
    });
    ({exists} = (await this.db.user.exists(config, {
      username: user
    })));
    if (!exists) {
      throw Error(`DB user does not exists: ${user}`);
    }
    switch (config.engine) {
      case 'mariadb':
      case 'mysql':
        // cmd_has_privileges = cmd config, admin_username: null, username: user.username, password: user.password, database: config.database, "SHOW TABLES FROM pg_database"
        cmd_has_privileges = cmd(config, {
          database: 'mysql'
        }, `SELECT user FROM db WHERE db='${config.database}';`) + ` | grep '${user}'`;
        cmd_grant_privileges = cmd(config, {
          database: null
        }, `GRANT ALL PRIVILEGES ON ${config.database}.* TO '${user}' WITH GRANT OPTION;`);
        break;
      case 'postgresql':
        cmd_has_privileges = cmd(config, {
          database: config.database
        }, "\\l") + ` | egrep '^${user}='`;
        cmd_grant_privileges = cmd(config, {
          database: null
        }, `GRANT ALL PRIVILEGES ON DATABASE ${config.database} TO ${user}`);
    }
    ({status} = (await this.execute({
      cmd: `if ${cmd_has_privileges}; then
  echo '[INFO] User already with privileges'
  exit 3
fi
echo '[WARN] User privileges granted'
${cmd_grant_privileges}`,
      code_skipped: 3
    })));
    if (status) {
      log({
        message: `Privileges granted: to ${JSON.stringify(user)} on ${JSON.stringify(config.database)}`,
        level: 'WARN',
        module: 'nikita/db/database'
      });
    }
  }
  return null;
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
({cmd, connection_config} = require('../query'));
