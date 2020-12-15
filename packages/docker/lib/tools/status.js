// Generated by CoffeeScript 2.5.1
// # `nikita.docker.tools.status`

// Return true if container is running. This function is not native to docker. 

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container is running.
// * `stdout`   
//   Stdout value(s) unless `stdout` option is provided.
// * `stderr`   
//   Stderr value(s) unless `stderr` option is provided.

// ## Example

// ```js
// const {status} = await nikita.docker.tools.status({
//   container: 'container1'
// })
// console.info(`Container is running: ${status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'container': {
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
      description: `Name or Id of the container.`
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
    tools: {find, log}
  }) {
  var k, ref, v;
  // Global config
  config.docker = (await find(function({
      config: {docker}
    }) {
    return docker;
  }));
  ref = config.docker;
  for (k in ref) {
    v = ref[k];
    if (config[k] == null) {
      config[k] = v;
    }
  }
  // Construct exec command
  return this.docker.tools.execute({
    command: `ps | egrep ' ${config.container}$'`,
    code_skipped: 1
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};
