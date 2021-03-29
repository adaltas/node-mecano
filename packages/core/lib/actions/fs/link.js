// Generated by CoffeeScript 2.5.1
// # `nikita.fs.link`

// Create a symbolic link and it's parent directories if they don't yet
// exist.

// Note, it is valid for the "source" file to not exist.

// ## Output

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if link was created or modified.   

// ## Example

// ```js
// const {status} = await nikita.fs.link({
//   source: __dirname,
//   target: '/tmp/a_link'
// })
// console.info(`Link was created: ${status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  config: {
    type: 'object',
    properties: {
      'source': {
        type: 'string',
        description: `Referenced file to be linked.`
      },
      'target': {
        type: 'string',
        description: `Symbolic link to be created.`
      },
      'exec': {
        type: 'boolean',
        description: `Create an executable file with an \`exec\` command.`
      },
      'mode': {
        $ref: 'module://@nikitajs/core/lib/actions/fs/base/chmod#/definitions/config/properties/mode'
      }
    },
    required: ['source', 'target']
  }
};

// ## Handler
handler = async function({
    config,
    tools: {path}
  }) {
  var content, exists;
  // Set default
  if (config.mode == null) {
    config.mode = 0o0755;
  }
  // It is possible to have collision if two symlink
  // have the same parent directory
  await this.fs.base.mkdir({
    target: path.dirname(config.target),
    $relax: 'EEXIST'
  });
  if (config.exec) {
    exists = (await this.call({
      $raw_output: true
    }, async function() {
      var data, exec_command;
      ({exists} = (await this.fs.base.exists({
        target: config.target
      })));
      if (!exists) {
        return false;
      }
      ({data} = (await this.fs.base.readFile({
        target: config.target,
        encoding: 'utf8'
      })));
      exec_command = /exec (.*) \$@/.exec(data)[1];
      return exec_command && exec_command === config.source;
    }));
    if (exists) {
      return;
    }
    content = `#!/bin/bash
exec ${config.source} $@`;
    await this.fs.base.writeFile({
      target: config.target,
      content: content
    });
    await this.fs.base.chmod({
      target: config.target,
      mode: config.mode
    });
  } else {
    exists = (await this.call({
      $raw_output: true
    }, async function() {
      var err, target;
      try {
        ({target} = (await this.fs.base.readlink({
          target: config.target
        })));
        if (target === config.source) {
          return true;
        }
        await this.fs.base.unlink({
          target: config.target
        });
        return false;
      } catch (error) {
        err = error;
        return false;
      }
    }));
    if (exists) {
      return;
    }
    await this.fs.base.symlink({
      source: config.source,
      target: config.target
    });
  }
  return true;
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};
