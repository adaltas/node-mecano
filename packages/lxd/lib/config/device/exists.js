// Generated by CoffeeScript 2.4.1
// # `nikita.lxd.config.device.exists`

// Add devices to containers or profiles.

// ## Options

// * `container` (string, required)
//   The name of the container.
// * `device` (string, required)
//   Name of the device in LXD configuration, for example "eth0".

// ## Add a network interface

// ```js
// require('nikita')
// .lxd.config.device.exists({
//   container: "my_container",
//   device: 'eth0',
// }, function(err, {status, config}) {
//   console.log( err ? err.message : status ?
//     'device exists, type is' + config.type : 'device missing')
// });
// ```

// ## Source Code
var diff, yaml;

module.exports = {
  shy: true,
  handler: function({options}, callback) {
    this.log({
      message: "Entering lxd.config.device.exists",
      level: 'DEBUG',
      module: '@nikitajs/lxd/lib/config/device/exists'
    });
    if (!options.container) {
      throw Error("Invalid Option: container is required");
    }
    if (!options.device) {
      throw Error("Invalid Option: device is required");
    }
    return this.system.execute({
      cmd: `${['lxc', 'config', 'device', 'show', options.container].join(' ')}`,
      code_skipped: 42,
      shy: true
    }, function(err, {stdout}) {
      var config;
      if (err) {
        return callback(err);
      }
      config = yaml.safeLoad(stdout);
      return callback(null, {
        status: !!config[options.device],
        config: config
      });
    });
  }
};

// ## Dependencies
yaml = require('js-yaml');

diff = require('object-diff');
