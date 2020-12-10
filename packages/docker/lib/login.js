// Generated by CoffeeScript 2.5.1
// # `nikita.docker.login`

// Register or log in to a Docker registry server.

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   True when the command was executed successfully.
// * `stdout`   
//   Stdout value(s) unless `stdout` option is provided.
// * `stderr`   
//   Stderr value(s) unless `stderr` option is provided.

// ## Schema
var handler, schema, utils;

schema = {
  type: 'object',
  properties: {
    'email': {
      type: 'string',
      description: `User email.`
    },
    'user': {
      type: 'string',
      description: `Username of the user.`
    },
    'password': {
      type: 'string',
      description: `User password.`
    },
    'boot2docker': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/boot2docker'
    },
    'compose': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/compose'
    },
    'machine': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/machine'
    }
  }
};

// ## Handler
handler = function({
    config,
    tools: {log}
  }) {
  log({
    message: "Entering Docker login",
    level: 'DEBUG',
    module: 'nikita/lib/docker/login'
  });
  return this.docker.tools.execute({
    command: [
      'login',
      ...(['email',
      'user',
      'password'].filter(function(opt) {
        return config[opt] != null;
      }).map(function(opt) {
        return `-${opt.charAt(0)} ${config[opt]}`;
      })),
      config.registry != null ? `${utils.string.escapeshellarg(config.registry)}` : void 0
    ].join(' ')
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker'
  },
  schema: schema
};

// ## Dependencies
utils = require('./utils');
