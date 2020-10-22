// Generated by CoffeeScript 2.5.1
// # `nikita.volume_rm`

// Remove a volume.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True is volume was removed.

// ## Example

// ```javascript
// nikita.docker.volume_rm({
//   name: 'my_volume'
// }, function(err, status){
//   console.log( err ? err.message : 'Volume removed: ' + status);
// })
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'name': {
      type: 'string',
      description: `Specify volume name.`
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
handler = async function({
    config,
    log,
    tools: {find}
  }) {
  var k, ref, v;
  log({
    message: "Entering Docker volume_rm",
    level: 'DEBUG',
    module: 'nikita/lib/docker/volume_rm'
  });
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
  if (!config.name) {
    // Validation
    throw Error("Missing required option name");
  }
  return this.docker.tools.execute({
    cmd: `volume rm ${config.name}`,
    code: 0,
    code_skipped: 1
  });
};

// ## Exports
module.exports = {
  handler: handler,
  schema: schema
};
