// Generated by CoffeeScript 2.5.1
// # `nikita.file.json`

// ## Example

// Merge the destination file with user provided content.

// ```js
// const {status} = await nikita.file.json({
//   target: "/path/to/target.json",
//   content: { preferences: { colors: 'blue' } },
//   transform: function(data){
//     if(data.indexOf('red') < 0){ data.push('red'); }
//     return data;
//   },
//   merge: true,
//   pretty: true
// })
// console.info(`File was merged: ${status}`)
// ```

// ## Hooks
var handler, merge, on_action, schema;

on_action = function({config, metadata}) {
  if (config.pretty === true) {
    return config.pretty = 2;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'backup': {
      oneOf: [
        {
          type: 'string'
        },
        {
          type: 'boolean'
        }
      ],
      default: false,
      description: `Create a backup, append a provided string to the filename extension or
a timestamp if value is not a string, only apply if the target file
exists and is modified.`
    },
    'content': {
      type: 'object',
      default: {},
      description: `The javascript code to stringify.`
    },
    'merge': {
      type: 'boolean',
      description: `Merge the user content with the content of the destination file if it
exists.`
    },
    'pretty': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'boolean'
        }
      ],
      default: false,
      description: `Prettify the JSON output, accept the number of spaces as an integer,
default to none if false or to 2 spaces indentation if true.`
    },
    'source': {
      type: 'string',
      description: `Path to a JSON file providing default values.`
    },
    'target': {
      type: 'string',
      description: `Path to the destination file.`
    },
    'transform': {
      typeof: 'function',
      description: `User provided function to modify the javascript before it is
stringified into JSON.`
    }
  },
  required: ['target']
};

// ## Handler
handler = async function({config}) {
  var data, err;
  if (config.merge) {
    try {
      ({data} = (await this.fs.base.readFile({
        target: config.target,
        encoding: 'utf8'
      })));
      config.content = merge(JSON.parse(data), config.content);
    } catch (error) {
      err = error;
      if (err.code !== 'NIKITA_FS_CRS_TARGET_ENOENT') {
        throw err;
      }
    }
  }
  if (config.source) {
    ({data} = (await this.fs.base.readFile({
      ssh: config.local ? false : void 0,
      sudo: config.local ? false : void 0,
      target: config.source,
      encoding: 'utf8'
    })));
    config.content = merge(JSON.parse(data), config.content);
  }
  if (config.transform) {
    config.content = config.transform(config.content);
  }
  await this.file({
    target: config.target,
    content: function() {
      return JSON.stringify(config.content, null, config.pretty);
    },
    backup: config.backup,
    diff: config.diff,
    eof: config.eof,
    gid: config.gid,
    uid: config.uid,
    mode: config.mode
  });
  return {};
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    schema: schema
  }
};

// ## Dependencies
({merge} = require('mixme'));
