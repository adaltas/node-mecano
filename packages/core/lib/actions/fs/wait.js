// Generated by CoffeeScript 2.5.1
// # `nikita.fs.wait`

// Wait for a file or directory to exists. Status will be
// set to "false" if the file already existed, considering that no
// change had occured. Otherwise it will be set to "true".

// ## Example

// ```js
// const {status} = await nikita.fs.wait({
//   target: '/path/to/file_or_directory'
// })
// console.info(`File was created: ${status}`)
// ```

// ## Hooks
var handler, on_action, schema;

on_action = {
  after: '@nikitajs/core/lib/plugins/metadata/argument_to_config',
  handler: function({config}) {
    if (typeof config.target === 'string') {
      return config.target = [config.target];
    }
  }
};

// ## Schema
schema = {
  config: {
    type: 'object',
    properties: {
      'target': {
        type: 'array',
        items: {
          type: 'string'
        },
        description: `Paths to the files and directories.`
      },
      'interval': {
        type: 'integer',
        default: 2000,
        description: `Time interval between which we should wait before re-executing the
check, default to 2s.`
      }
    },
    required: ['target']
  }
};

// ## Handler
handler = async function({config}, callback) {
  var exists, i, len, ref, status, target;
  status = false;
  ref = config.target;
  // Validate parameters
  for (i = 0, len = ref.length; i < len; i++) {
    target = ref[i];
    ({exists} = (await this.fs.base.exists(target)));
    if (exists) {
      continue;
    }
    await this.wait(config.interval);
    while (true) {
      ({exists} = (await this.fs.base.exists(target)));
      if (exists) {
        break;
      }
      status = true;
      this.log({
        message: "Wait for file to be created",
        level: 'INFO'
      });
      await this.wait(config.interval);
    }
  }
  return status;
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    argument_to_config: 'target',
    schema: schema
  }
};
