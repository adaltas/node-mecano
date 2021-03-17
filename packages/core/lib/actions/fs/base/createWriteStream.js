// Generated by CoffeeScript 2.5.1
// # `nikita.fs.base.createWriteStream`

// ## Example

// ```js
// const {status} = await nikita.fs.base.createWriteStream({
//   target: '/path/to/file'
//   stream: function(ws){
//     ws.write('some content')
//     ws.end()
//   }
// })
// console.info(`Stream was created: ${status}`)
// ```

// ## Hooks
var errors, fs, handler, on_action, schema, utils;

on_action = {
  after: ['@nikitajs/core/lib/plugins/execute'],
  before: ['@nikitajs/core/lib/plugins/schema', '@nikitajs/core/lib/plugins/metadata/tmpdir'],
  handler: async function({
      config,
      metadata,
      tools: {find}
    }) {
    var ref;
    if (metadata.argument != null) {
      config.target = metadata.argument;
    }
    if (config.sudo == null) {
      config.sudo = (await find(function({
          metadata: {sudo}
        }) {
        return sudo;
      }));
    }
    if (config.sudo || ((ref = config.flags) != null ? ref[0] : void 0) === 'a') {
      return metadata.tmpdir = true;
    }
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'flags': {
      type: 'string',
      default: 'w',
      description: `File system flag as defined in the [Node.js
documentation](https://nodejs.org/api/fs.html#fs_file_system_flags)
and [open(2)](http://man7.org/linux/man-pages/man2/open.2.html)`
    },
    'target_tmp': {
      type: 'string',
      description: `Location where to write the temporary uploaded file before it is
copied into its final destination, default to
"{tmpdir}/nikita_{YYMMDD}_{pid}_{rand}/{hash target}"`
    },
    'mode': {
      $ref: 'module://@nikitajs/core/lib/actions/fs/base/chmod#/properties/mode'
    },
    'stream': {
      typeof: 'function',
      description: `User provided function receiving the newly created writable stream.
The user is responsible for writing new content and for closing the
stream.`
    },
    'target': {
      oneOf: [
        {
          type: 'string'
        },
        {
          instanceof: 'Buffer'
        }
      ],
      description: `Final destination path.`
    }
  },
  required: ['target', 'stream']
};

// ## Handler
handler = async function({
    config,
    metadata,
    ssh,
    tools: {find, log}
  }) {
  var err;
  // Normalize config
  if (config.sudo || config.flags[0] === 'a') {
    if (config.target_tmp == null) {
      config.target_tmp = `${metadata.tmpdir}/${utils.string.hash(config.target)}`;
    }
  }
  try {
    // config.mode ?= 0o644 # Node.js default to 0o666
    // In append mode, we write to a copy of the target file located in a temporary location
    if (config.flags[0] === 'a') {
      await this.execute(`[ ! -f '${config.target}' ] && exit
cp '${config.target}' '${config.target_tmp}'`);
      log({
        message: "Append prepared by placing a copy of the original file in a temporary path",
        level: 'INFO'
      });
    }
  } catch (error) {
    err = error;
    log({
      message: "Failed to place original file in temporary path",
      level: 'ERROR'
    });
    throw err;
  }
  // Start writing the content
  log({
    message: 'Writting file',
    level: 'DEBUG'
  });
  await new Promise(async function(resolve, reject) {
    var ws;
    ws = (await fs.createWriteStream(ssh, config.target_tmp || config.target, {
      flags: config.flags,
      mode: config.mode
    }));
    config.stream(ws);
    err = false; // Quick fix ws sending both the error and close events on error
    ws.on('error', function(err) {
      if (err.code === 'ENOENT') {
        err = errors.NIKITA_FS_CWS_TARGET_ENOENT({
          config: config
        });
      }
      return reject(err);
    });
    ws.on('end', function() {
      return ws.destroy();
    });
    return ws.on('close', function() {
      if (!err) {
        return resolve();
      }
    });
  });
  // Replace the target file in append or sudo mode
  if (config.target_tmp) {
    return (await this.execute({
      command: `mv '${config.target_tmp}' '${config.target}'`
    }));
  }
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    log: false,
    raw_output: true,
    schema: schema
  },
  hooks: {
    on_action: on_action
  }
};

// ## Errors
errors = {
  NIKITA_FS_CWS_TARGET_ENOENT: function({config}) {
    return utils.error('NIKITA_FS_CWS_TARGET_ENOENT', ['fail to write a file,', !config.target_tmp ? `location is ${JSON.stringify(config.target)}.` : `location is ${JSON.stringify(config.target_tmp)} (temporary file, target is ${JSON.stringify(config.target)}).`], {
      errno: -2,
      path: config.target_tmp || config.target, // Native Node.js api doesn't provide path
      syscall: 'open'
    });
  }
};

// ## Dependencies
fs = require('ssh2-fs');

utils = require('../../../utils');
