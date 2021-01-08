// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.config.delete`

// Delete a device from a container

// ## Output

// * `err`
//   Error object if any.
// * `result.status`
//   True if the device was removed False otherwise.

// ## Example

// ```js
// const {status} = await nikita.lxd.config.device.delete({
//   container: 'container1',
//   device: 'root'
// })
// console.info(`Device was removed: ${status}`)
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
  var properties, status;
  ({properties} = (await this.lxd.config.device.show({
    container: config.container,
    device: config.device
  })));
  if (!properties) {
    return {
      status: false
    };
  }
  ({status} = (await this.execute({
    command: ['lxc', 'config', 'device', 'remove', config.container, config.device].join(' ')
  })));
  return {
    status: status
  };
};

// ## Export
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};
