// Generated by CoffeeScript 2.5.1
// # `nikita.ldap.tools.databases`

// List the databases of the OpenLDAP server. It returns the `olcDatabase` value.

// ## Example

// ```js
// const {databases} = await nikita.ldap.tools.databases({
//   uri: 'ldap://localhost',
//   binddn: 'cn=admin,cn=config',
//   passwd: 'config'
// })
// // Value is similar to `[ '{-1}frontend', '{0}config', '{1}mdb' ]`
// databases.map( database => {
//   console.info(`Database: ${database}`)
// })
// ```

// ## Schema
var handler, schema, utils;

schema = {
  type: 'object',
  allOf: [
    {
      properties: {
        'base': {
          const: 'cn=config',
          default: 'cn=config'
        }
      }
    },
    {
      $ref: 'module://@nikitajs/ldap/lib/search'
    }
  ]
};

// ## Handler
handler = async function({config}) {
  var databases, stdout;
  ({stdout} = (await this.ldap.search(config, {
    base: config.base,
    filter: '(objectClass=olcDatabaseConfig)',
    attributes: ['olcDatabase']
  })));
  databases = utils.string.lines(stdout).filter(function(line) {
    return /^olcDatabase: /.test(line);
  }).map(function(line) {
    return line.split(' ')[1];
  });
  return {
    databases: databases
  };
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'ldap',
    schema: schema
  }
};

// ## Dependencies
utils = require('../utils');
