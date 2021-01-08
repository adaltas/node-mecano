// Generated by CoffeeScript 2.5.1
// # `nikita.docker.rm`

// Remove one or more containers. Containers need to be stopped to be deleted unless
// force options is set.

// ## Output

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
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/boot2docker'
    },
    'compose': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/compose'
    },
    'machine': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/machine'
    }
  },
  required: ['container']
};

// ## Handler
handler = async function({config}) {
  var exists, running;
  ({
    status: exists,
    data: running
  } = (await this.docker.tools.execute({
    metadata: {
      templated: false
    },
    command: `inspect ${config.container} --format '{{ json .State.Running }}'`,
    code_skipped: 1,
    format: 'json'
  })));
  if (!exists) {
    return false;
  }
  if (running && !config.force) {
    throw Error('Container must be stopped to be removed without force');
  }
  return (await this.docker.tools.execute({
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
    ].join(' ')
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
