// Generated by CoffeeScript 2.5.1
// # `nikita.system.mkdir`

// Recursively create a directory. The behavior is similar to the Unix command
// `mkdir -p`. It supports an alternative syntax where config is simply the path
// of the directory to create.

// ## Callback Parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if directory was created or modified.   

// ## Simple usage

// ```js
// require('nikita')
// .fs.mkdir('./some/dir', function(err, {status}){
//   console.info(err ? err.message : "Directory created: " + status);
// });
// ```

// ## Advanced usage

// ```js
// require('nikita')
// .fs.mkdir({
//   ssh: ssh,
//   target: './some/dir',
//   uid: 'a_user',
//   gid: 'a_group'
//   mode: 0o0777 // or '777'
// }, function(err, {status}){
//   console.info(err ? err.message : 'Directory created: ' + status);
// });
// ```

// ## Hook
var error, errors, handler, on_action, schema, utils;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    return config.target = metadata.argument;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'cwd': {
      oneOf: [
        {
          type: 'boolean'
        },
        {
          type: 'string'
        }
      ],
      description: `Current working directory for relative paths. A boolean value only
apply without an SSH connection and default to \`process.cwd()\`.`
    },
    'exclude': {
      instanceof: 'RegExp',
      description: `Exclude directories matching a regular expression. For exemple, the
expression \`/\${/\` on './var/cache/\${user}' exclude the directories
containing a variables and only apply to \`./var/cache/\`. `
    },
    'gid': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ],
      description: `Unix group name or id who owns the target directory.`
    },
    'mode': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ],
      // default: 0o755
      description: `Directory mode. Modes may be absolute or symbolic. An absolute mode is
an octal number. A symbolic mode is a string with a particular syntax
describing \`who\`, \`op\` and \`perm\` symbols.`
    },
    'parent': {
      oneOf: [
        {
          type: 'boolean'
        },
        {
          type: 'object',
          properties: {
            'mode': {
              $ref: '#/properties/mode'
            }
          }
        }
      ],
      description: `Create parent directory with provided attributes if an object or default 
system options if "true", supported attributes include 'mode', 'uid', 'gid', 
'size', 'atime', and 'mtime'.`
    },
    'target': {
      type: 'string',
      description: `Location of the directory to be created.`
    },
    'uid': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ],
      description: `Unix user name or id who owns the target directory.`
    }
  },
  required: ['target']
};


// ## Handler
handler = async function({
    config,
    metadata,
    tools: {log, path},
    ssh
  }) {
  var attr, creates, err, i, j, k, l, len, len1, len2, opts, parents, ref, ref1, ref2, stats, target, val;
  if (!ssh && (config.cwd === true || !config.cwd)) {
    // Configuration validation
    config.cwd = process.cwd();
  }
  if (config.parent === true) {
    config.parent = {};
  }
  config.target = config.cwd ? path.resolve(config.cwd, config.target) : path.normalize(config.target);
  if (ssh && !path.isAbsolute(config.target)) {
    throw errors.NIKITA_MKDIR_TARGET_RELATIVE({
      config: config
    });
  }
  // Retrieve every directories including parents
  parents = config.target.split(path.sep);
  parents.shift(); // first element is empty with absolute path
  if (parents[parents.length - 1] === '') {
    parents.pop();
  }
  parents = (function() {
    var j, ref, results;
    results = [];
    for (i = j = 0, ref = parents.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      results.push('/' + parents.slice(0, parents.length - i).join('/'));
    }
    return results;
  })();
  // Discovery of directories to create
  creates = [];
  for (i = j = 0, len = parents.length; j < len; i = ++j) {
    target = parents[i];
    try {
      ({stats} = (await this.fs.base.stat(target)));
      if (utils.stats.isDirectory(stats.mode)) {
        break;
      }
      throw errors.NIKITA_MKDIR_TARGET_INVALID_TYPE({
        stats: stats,
        target: target
      });
    } catch (error1) {
      err = error1;
      if (err.code === 'NIKITA_FS_STAT_TARGET_ENOENT') {
        creates.push(target);
      } else {
        throw err;
      }
    }
  }
  ref = creates.reverse();
  // Target and parent directory creation
  for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
    target = ref[i];
    if ((config.exclude != null) && config.exclude instanceof RegExp) {
      if (config.exclude.test(path.basename(target))) {
        break;
      }
    }
    opts = {};
    ref1 = ['mode', 'uid', 'gid', 'size', 'atime', 'mtime'];
    for (l = 0, len2 = ref1.length; l < len2; l++) {
      attr = ref1[l];
      val = i === creates.length - 1 ? config[attr] : (ref2 = config.parent) != null ? ref2[attr] : void 0;
      if (val != null) {
        opts[attr] = val;
      }
    }
    await this.fs.base.mkdir(target, opts);
    log({
      message: `Directory \"${target}\" created `,
      level: 'INFO',
      module: 'nikita/lib/system/mkdir'
    });
  }
  // Target directory update
  if (creates.length === 0) {
    log({
      message: "Directory already exists",
      level: 'DEBUG',
      module: 'nikita/lib/system/mkdir'
    });
    this.fs.chown({
      target: config.target,
      stats: stats,
      uid: config.uid,
      gid: config.gid,
      if: (config.uid != null) || (config.gid != null)
    });
    this.fs.chmod({
      target: config.target,
      stats: stats,
      mode: config.mode,
      if: config.mode != null
    });
  }
  return {};
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  schema: schema
};

// ## Errors
errors = {
  NIKITA_MKDIR_TARGET_RELATIVE: function({config}) {
    return error('NIKITA_MKDIR_TARGET_RELATIVE', ['only absolute path are supported over SSH,', 'target is relative and config `cwd` is not provided,', `got ${JSON.stringify(config.target)}`], {
      target: config.target
    });
  },
  NIKITA_MKDIR_TARGET_INVALID_TYPE: function({stats, target}) {
    return error('NIKITA_MKDIR_TARGET_INVALID_TYPE', ['target exists but it is not a directory,', `got ${JSON.stringify(utils.stats.type(stats.mode))} type`], {
      target: target
    });
  }
};

// ## Dependencies
utils = require('../../utils');

error = require('../../utils/error');