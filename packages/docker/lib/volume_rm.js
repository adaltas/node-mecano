// Generated by CoffeeScript 2.5.1
// # `nikita.docker.volume_rm`

// Remove a volume.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True is volume was removed.

// ## Example

// ```js
// const {status} = await nikita.docker.volume_rm({
//   name: 'my_volume'
// })
// console.info(`Volume was removed: ${status}`)
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
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/boot2docker'
    },
    'compose': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/compose'
    },
    'machine': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/machine'
    }
  }
};

// ## Handler
handler = async function({config}) {
  if (!config.name) {
    // Validation
    throw Error("Missing required option name");
  }
  return (await this.docker.tools.execute({
    command: `volume rm ${config.name}`,
    code: 0,
    code_skipped: 1
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
