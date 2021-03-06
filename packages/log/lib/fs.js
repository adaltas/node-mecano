// Generated by CoffeeScript 2.5.1
// # `nikita.log.fs`

// Write log to the host filesystem in a user provided format.

// ## Layout

// By default, a file name "{ssh.host}.log" over SSH or "local.log" will be created
// inside the base directory defined by the option "basedir". The path looks like
// "{config.basedir}/{config.filename}.log".

// If the option "archive" is activated, a folder named after the current time is
// created inside the base directory. A symbolic link named as "latest" will point
// this is direction. The paths look like
// "{config.basedir}/{time}/{config.filename}.log" and "{config.basedir}/latest".

// ## Hooks
var definitions, fs, handler, on_action, path;

on_action = {
  before: ['@nikitajs/core/lib/plugins/metadata/schema'],
  after: ['@nikitajs/core/lib/plugins/ssh'],
  handler: function({config, ssh}) {
    var ref;
    // With ssh, filename contain the host or ip address
    if (config.filename == null) {
      config.filename = `${(ssh != null ? (ref = ssh.config) != null ? ref.host : void 0 : void 0) || 'local'}.log`;
    }
    // Log is always local
    return config.ssh = false;
  }
};

// ## Schema definitions
definitions = {
  config: {
    type: 'object',
    properties: {
      'archive': {
        type: 'boolean',
        default: false,
        description: `Save a copy of the previous logs inside a dedicated directory.`
      },
      'basedir': {
        type: 'string',
        default: './log',
        description: `Directory where to store logs relative to the process working
directory. Default to the "log" directory. Note, when the \`archive\`
option is activated, the log files will be stored accessible from
"./log/latest".`
      },
      'filename': {
        type: 'string',
        // default: 'local.log'
        description: `Name of the log file. The default behavior rely on the templated
plugin to contextually render the filename.`
      },
      'serializer': {
        type: 'object',
        description: `An object of key value pairs where keys are the event types and the
value is a function which must be implemented to serialize the
information.`
      }
    },
    required: ['serializer']
  }
};

// ## Handler
handler = async function({config}) {
  var err, latestdir, logdir, now;
  // Normalization
  config.basedir = path.resolve(config.basedir);
  // Archive config
  if (!config.archive) {
    logdir = path.resolve(config.basedir);
  } else {
    latestdir = path.resolve(config.basedir, 'latest');
    now = new Date();
    if (config.archive === true) {
      config.archive = `${now.getFullYear()}`.slice(-2) + `0${now.getFullYear()}`.slice(-2) + `0${now.getDate()}`.slice(-2);
    }
    logdir = path.resolve(config.basedir, config.archive);
  }
  try {
    await this.fs.base.mkdir(logdir, {
      ssh: false
    });
  } catch (error) {
    err = error;
    if (err.code !== 'NIKITA_FS_MKDIR_TARGET_EEXIST') {
      throw err;
    }
  }
  // Events
  if (config.stream == null) {
    config.stream = fs.createWriteStream(path.resolve(logdir, config.filename));
  }
  await this.log.stream(config);
  // Handle link to latest directory
  return (await this.fs.base.symlink({
    $if: latestdir,
    source: logdir,
    target: latestdir
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    definitions: definitions
  }
};

// ## Dependencies
fs = require('fs');

path = require('path');
