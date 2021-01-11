// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.config.device.exists`

// Check if the device exists in a container.

// ## Callback parameters

// * `err`
//   Error object if any.
// * `result.status`
//   True if the device exist, false otherwise.

// ## Add a network interface

// ```js
// const {status, config} = await nikita.lxd.config.device.exists({
//   container: "my_container",
//   device: 'eth0'
// })
// console.info(status ? `device exists, type is ${config.type}` : 'device missing')
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'container': {
      $ref: 'module://@nikitajs/lxd/lib/init#/properties/container'
    },
    'device': {
      type: 'string',
      description: `Name of the device in LXD configuration, for example "eth0".`
    }
  },
  required: ['container', 'device']
};

// ## Handler
handler = async function({config}) {
  var properties;
  ({properties} = (await this.lxd.config.device.show({
    container: config.container,
    device: config.device
  })));
  return {
    exists: !!properties,
    properties: properties
  };
};

// ## Export
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};
