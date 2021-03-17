// Generated by CoffeeScript 2.5.1
// # `nikita.fs.base.createReadStream`

// ## Example

// The `stream` config property receives the readable stream:

// ```js
// buffers = []
// await nikita.fs.base.createReadStream({
//   target: '/path/to/file'
//   stream: function(rs){
//     rs.on('readable', function(){
//       while(buffer = rs.read()){
//         buffers.push(buffer)
//       }
//     })
//   }
// })
// console.info(Buffer.concat(buffers).toString())
// ```

// Alternatively, you can directly provide the readable function with the
// `on_readable` config property:

// ```js
// buffers = []
// await nikita.fs.base.createReadStream({
//   target: '/path/to/file'
//   on_readable: function(rs){
//     while(buffer = rs.read()){
//       buffers.push(buffer)
//     }
//   }
// })
// console.info(Buffer.concat(buffers).toString())
// ```

// ## Hook
var errors, fs, handler, on_action, schema, utils;

on_action = {
  after: ['@nikitajs/core/lib/plugins/execute'],
  before: ['@nikitajs/core/lib/plugins/schema', '@nikitajs/core/lib/plugins/metadata/tmpdir'],
  handler: async function({
      config,
      metadata,
      tools: {find, walk}
    }) {
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
    if (config.sudo) {
      return metadata.tmpdir != null ? metadata.tmpdir : metadata.tmpdir = true;
    }
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'encoding': {
      type: 'string',
      enum: require('../../../utils/schema').encodings,
      default: 'utf8',
      description: `The encoding used to decode the buffer into a string. The encoding can
be any one of those accepted by Buffer. When not defined, this action
return a Buffer instance.`
    },
    'on_readable': {
      typeof: 'function',
      description: `User provided function called when the readable stream is created and
readable. The user is responsible for pumping new content from it. It
is a short version of \`config.stream\` which registers the function to
the \`readable\` event.`
    },
    'stream': {
      typeof: 'function',
      description: `User provided function receiving the newly created readable stream.
The user is responsible for pumping new content from it.`
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
      description: `Source location of the file to read.`
    }
  },
  required: ['target']
};

// ## Handler
handler = async function({
    config,
    metadata,
    ssh,
    tools: {path, log, find}
  }) {
  var current_username, err;
  // Normalization
  config.target = config.cwd ? path.resolve(config.cwd, config.target) : path.normalize(config.target);
  if (ssh && !path.isAbsolute(config.target)) {
    throw Error(`Non Absolute Path: target is ${JSON.stringify(config.target)}, SSH requires absolute paths, you must provide an absolute path in the target or the cwd option`);
  }
  if (config.sudo) {
    if (config.target_tmp == null) {
      config.target_tmp = `${metadata.tmpdir}/${utils.string.hash(config.target)}`;
    }
  }
  if (!(config.on_readable || config.stream)) {
    throw errors.NIKITA_FS_CRS_NO_EVENT_HANDLER();
  }
  // Guess current username
  current_username = utils.os.whoami({
    ssh: ssh
  });
  try {
    if (config.target_tmp) {
      await this.execute(`[ ! -f '${config.target}' ] && exit
cp '${config.target}' '${config.target_tmp}'
chown '${current_username}' '${config.target_tmp}'`);
      log({
        message: "Placing original file in temporary path before reading",
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
  // Read the stream
  log({
    message: `Reading file ${config.target_tmp || config.target}`,
    level: 'DEBUG'
  });
  return new Promise(async function(resolve, reject) {
    var buffers, rs;
    buffers = [];
    rs = (await fs.createReadStream(ssh, config.target_tmp || config.target));
    if (config.on_readable) {
      rs.on('readable', function() {
        return config.on_readable(rs);
      });
    } else {
      config.stream(rs);
    }
    rs.on('error', function(err) {
      if (err.code === 'ENOENT') {
        err = errors.NIKITA_FS_CRS_TARGET_ENOENT({
          config: config,
          err: err
        });
      } else if (err.code === 'EISDIR') {
        err = errors.NIKITA_FS_CRS_TARGET_EISDIR({
          config: config,
          err: err
        });
      } else if (err.code === 'EACCES') {
        err = errors.NIKITA_FS_CRS_TARGET_EACCES({
          config: config,
          err: err
        });
      }
      return reject(err);
    });
    return rs.on('end', resolve);
  });
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    log: false,
    raw_output: true,
    tmpdir: true,
    schema: schema
  }
};

// ## Errors
errors = {
  NIKITA_FS_CRS_NO_EVENT_HANDLER: function() {
    return utils.error('NIKITA_FS_CRS_NO_EVENT_HANDLER', ['unable to consume the readable stream,', 'one of the "on_readable" or "stream"', 'hooks must be provided']);
  },
  NIKITA_FS_CRS_TARGET_ENOENT: function({err, config}) {
    return utils.error('NIKITA_FS_CRS_TARGET_ENOENT', ['fail to read a file because it does not exist,', !config.target_tmp ? `location is ${JSON.stringify(config.target)}.` : `location is ${JSON.stringify(config.target_tmp)} (temporary file, target is ${JSON.stringify(config.target)}).`], {
      errno: err.errno,
      syscall: err.syscall,
      path: err.path
    });
  },
  NIKITA_FS_CRS_TARGET_EISDIR: function({err, config}) {
    return utils.error('NIKITA_FS_CRS_TARGET_EISDIR', ['fail to read a file because it is a directory,', !config.target_tmp ? `location is ${JSON.stringify(config.target)}.` : `location is ${JSON.stringify(config.target_tmp)} (temporary file, target is ${JSON.stringify(config.target)}).`], {
      errno: err.errno,
      syscall: err.syscall,
      path: config.target_tmp || config.target // Native Node.js api doesn't provide path
    });
  },
  NIKITA_FS_CRS_TARGET_EACCES: function({err, config}) {
    return utils.error('NIKITA_FS_CRS_TARGET_EACCES', ['fail to read a file because permission was denied,', !config.target_tmp ? `location is ${JSON.stringify(config.target)}.` : `location is ${JSON.stringify(config.target_tmp)} (temporary file, target is ${JSON.stringify(config.target)}).`], {
      errno: err.errno,
      syscall: err.syscall,
      path: config.target_tmp || config.target // Native Node.js api doesn't provide path
    });
  }
};


// ## Dependencies
fs = require('ssh2-fs');

utils = require('../../../utils');
