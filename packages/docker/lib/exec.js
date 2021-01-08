// Generated by CoffeeScript 2.5.1
// # `nikita.docker.exec`

// Run a command in a running container

// ## Output

// * `err`   
//   Error object if any.   
// * `status`   
//   True if command was executed in container.
// * `stdout`   
//   Stdout value(s) unless `stdout` option is provided.   
// * `stderr`   
//   Stderr value(s) unless `stderr` option is provided.   

// ## Example

// ```js
// const {status} = await nikita.docker.exec({
//   container: 'myContainer',
//   command: '/bin/bash -c "echo toto"'
// })
// console.info(`Command was executed: ${status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'container': {
      type: 'string',
      description: `Name/ID of the container`
    },
    'code_skipped': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'array',
          items: {
            type: 'integer'
          }
        }
      ],
      description: `The exit code(s) to skip.`
    },
    'service': {
      type: 'boolean',
      default: false,
      description: `If true, run container as a service, else run as a command, true by
default.`
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
      description: `Username or uid.`
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
      description: `Groupname or gid.`
    },
    'boot2docker': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/boot2docker'
    },
    'compose': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/compose'
    },
    'machine': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/machine'
    }
  },
  required: ['container', 'command']
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var command;
  if (config.service == null) {
    config.service = false;
  }
  // Construct exec command
  command = 'exec';
  if (config.uid != null) {
    command += ` -u ${config.uid}`;
    if (config.gid != null) {
      command += `:${config.gid}`;
    }
  } else if (config.gid != null) {
    log({
      message: 'config.gid ignored unless config.uid is provided',
      level: 'WARN',
      module: 'nikita/lib/docker/exec'
    });
  }
  command += ` ${config.container} ${config.command}`;
  // delete config.command
  return (await this.docker.tools.execute({
    command: command,
    code_skipped: config.code_skipped
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker',
    schema: schema
  }
};
