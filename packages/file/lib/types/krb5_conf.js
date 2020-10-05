// Generated by CoffeeScript 2.5.1
// `nikita.file.types.krb5_conf`

// Modify the client Kerberos configuration file located by default in
// "/etc/krb5.conf". Kerberos is a network authentication protocol. It is designed
// to provide strong authentication for client/server applications by using
// secret-key cryptography.

// ## Schema
var handler, schema, utils;

schema = {
  type: 'object',
  properties: {
    'rootdir': {
      type: 'string',
      description: `Path to the mount point corresponding to the root directory, optional.`
    },
    'backup': {
      type: ['string', 'boolean'],
      description: `Create a backup, append a provided string to the filename extension or
a timestamp if value is not a string, only apply if the target file
exists and is modified.`
    },
    'clean': {
      type: 'boolean',
      description: `Remove all the lines whithout a key and a value, default to "true".`
    },
    'content': {
      type: 'object',
      description: `Object to stringify.`
    },
    'merge': {
      type: 'boolean',
      description: `Read the target if it exists and merge its content.`
    },
    'target': {
      type: 'string',
      description: `Destination file.`
    }
  },
  required: ['content']
};

// ## Example registering a new realm

// ```js
// require('nikita')
// .file.types.krb_conf({
//   merge: true,
//   content: {
//     realms: {
//       'MY.DOMAIN': {
//         kdc: 'ipa.domain.com:88',
//         admin_server: 'ipa.domain.com:749',
//         default_domain: 'domain.com'
//       }
//     }
//   }
// }, function(err, {status}){
//   console.info( err ? err.message : status
//     ? 'Configuration was updated'
//     : 'No change occured' )
// })
// ```

// ## Handler
handler = function({
    config,
    operations: {log}
  }) {
  // log message: "Entering file.types.krb5_conf", level: 'DEBUG', module: 'nikita/lib/file/types/krb5_conf'
  if (config.target == null) {
    config.target = '/etc/krb5.conf';
  }
  return this.file.ini({
    parse: utils.ini.parse_brackets_then_curly,
    stringify: utils.ini.stringify_brackets_then_curly
  }, config);
};

// ## Exports
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
utils = require('../utils');
