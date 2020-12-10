// Generated by CoffeeScript 2.5.1
// # `nikita.fs.base.rmdir`

// Delete a directory.

// ## Hook
var errors, handler, on_action, schema, utils;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    return config.target = metadata.argument;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'target': {
      oneOf: [
        {
          type: 'string'
        },
        {
          instanceof: 'Buffer'
        }
      ],
      description: `Location of the directory to remove.`
    }
  },
  required: ['target']
};

// ## Handler
handler = async function({config}) {
  var err;
  try {
    await this.execute({
      command: `[ ! -d '${config.target}' ] && exit 2
rmdir '${config.target}'`
    });
    return this.log({
      message: "Directory successfully removed",
      level: 'INFO',
      module: 'nikita/lib/fs/write'
    });
  } catch (error) {
    err = error;
    if (err.exit_code === 2) {
      err = errors.NIKITA_FS_RMDIR_TARGET_ENOENT({
        config: config,
        err: err
      });
    }
    throw err;
  }
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    log: false,
    raw_output: true
  },
  schema: schema
};

// ## Errors
errors = {
  NIKITA_FS_RMDIR_TARGET_ENOENT: function({config, err}) {
    return utils.error('NIKITA_FS_RMDIR_TARGET_ENOENT', ['fail to remove a directory, target is not a directory,', `got ${JSON.stringify(config.target)}`], {
      exit_code: err.exit_code,
      errno: -2,
      syscall: 'rmdir',
      path: config.target
    });
  }
};

// ## Dependencies
utils = require('../../../utils');
