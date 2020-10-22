// Generated by CoffeeScript 2.5.1
// # `nikita.docker.unpause`

// Unpause all processes within a container.

// ## Options

// * `boot2docker` (boolean)   
//   Whether to use boot2docker or not, default to false.
// * `container` (string)   
//   Name/ID of the container, required.
// * `machine` (string)   
//   Name of the docker-machine, required if using docker-machine.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container was unpaused.

// ## Example

// ```javascript
// require('nikita')
// .docker.pause({
//   container: 'toto'
// }, function(err, {status}){
//   console.info( err ? err.message : 'Container was unpaused: ' + status);
// })
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
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
    tools: {find, log}
  }) {
  log({
    message: "Entering Docker unpause",
    level: 'DEBUG',
    module: 'nikita/lib/docker/unpause'
  });
  if (config.container == null) {
    // Validation
    throw Error('Missing container parameter');
  }
  return this.docker.tools.execute({
    cmd: `unpause ${config.container}`
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
