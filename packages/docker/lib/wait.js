// Generated by CoffeeScript 2.5.1
// # `nikita.docker.wait`

// Block until a container stops.

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   True unless container was already stopped.

// ## Example

// ```js
// const {status} = await nikita.docker.wait({
//   container: 'toto'
// })
// console.info(`Did we really had to wait: ${status}`)
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
  require: ['container']
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  log({
    message: "Entering Docker wait",
    level: 'DEBUG',
    module: 'nikita/lib/docker/wait'
  });
  // Old implementation was `wait {container} | read r; return $r`
  return (await this.docker.tools.execute(`wait ${config.container}`));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker',
    schema: schema
  }
};
