// Generated by CoffeeScript 2.5.1
// # `nikita.docker.rm`

// Remove one or more containers. Containers need to be stopped to be deleted unless
// force options is set.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container was removed.

// ## Example Code

// ```js
// const {status} = await nikita.docker.rm({
//   container: 'toto'
// })
// console.info(`Container was removed: ${status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'container': {
      type: 'string',
      description: `Name/ID of the container.`
    },
    'link': {
      type: 'boolean',
      description: `Remove the specified link.`
    },
    'volumes': {
      type: 'boolean',
      description: `Remove the volumes associated with the container.`
    },
    'force': {
      type: 'boolean',
      description: `Force the removal of a running container (uses SIGKILL).`
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
  },
  required: ['container']
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var status;
  log({
    message: "Entering Docker rm",
    level: 'DEBUG',
    module: 'nikita/lib/docker/rm'
  });
  // command = for opt in ['link', 'volumes', 'force']
  //   "-#{opt.charAt 0}" if config[opt]
  // command = "rm #{command.join ' '} #{config.container}"
  ({status} = (await this.docker.tools.execute({
    command: `ps | egrep ' ${config.container}$'`,
    code_skipped: 1
  })));
  if (status && !config.force) {
    throw Error('Container must be stopped to be removed without force');
  }
  ({status} = (await this.docker.tools.execute({
    command: `ps -a | egrep ' ${config.container}$'`,
    code_skipped: 1
  })));
  return this.docker.tools.execute({
    command: [
      'rm',
      ...(['link',
      'volumes',
      'force'].filter(function(opt) {
        return config[opt];
      }).map(function(opt) {
        return `-${opt.charAt(0)}`;
      })),
      config.container
    ].join(' '),
    if: function() {
      return status;
    }
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
