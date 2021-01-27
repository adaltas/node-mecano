// Generated by CoffeeScript 2.5.1
var Ajv, ajv_formats, ajv_keywords, error, is_object_literal, parse;

error = require('../utils/error');

Ajv = require('ajv').default;

ajv_keywords = require('ajv-keywords');

ajv_formats = require("ajv-formats");

({is_object_literal} = require('mixme'));

parse = function(uri) {
  var matches;
  matches = /^(\w+:)\/\/(.*)/.exec(uri);
  if (!matches) {
    throw error('SCHEMA_URI_INVALID_PROTOCOL', ['uri must start with a valid protocol', 'such as "module://" or "registry://",', `got ${uri}.`]);
  }
  return {
    protocol: matches[1],
    pathname: matches[2]
  };
};

module.exports = {
  name: '@nikitajs/engine/lib/plugins/schema',
  hooks: {
    'nikita:session:normalize': {
      handler: function(action, handler) {
        return async function() {
          var ajv, ref;
          // Handler execution
          action = (await handler.apply(null, arguments));
          if (action.tools == null) {
            action.tools = {};
          }
          // Get schema from parent action
          if ((ref = action.parent) != null ? ref.tools.schema : void 0) {
            action.tools.schema = action.parent.tools.schema;
            return action;
          }
          // Instantiate a new schema
          ajv = new Ajv({
            $data: true,
            allErrors: true,
            useDefaults: true,
            allowUnionTypes: true, // eg type: ['boolean', 'integer']
            // extendRefs: true
            // coerceTypes: true
            loadSchema: function(uri) {
              return new Promise(async function(accept, reject) {
                var module, pathname, protocol;
                ({protocol, pathname} = parse(uri));
                switch (protocol) {
                  case 'module:':
                    action = require.main.require(pathname);
                    return accept(action.metadata.schema);
                  case 'registry:':
                    module = pathname.split('/');
                    action = (await action.registry.get(module));
                    return accept(action.metadata.schema);
                }
              });
            }
          });
          ajv_keywords(ajv);
          ajv_formats(ajv);
          action.tools.schema = {
            ajv: ajv,
            add: function(schema, name) {
              if (!schema) {
                return;
              }
              return ajv.addSchema(schema, name);
            },
            validate: async function(action, schema) {
              var validate;
              validate = (await ajv.compileAsync(schema));
              if (validate(action.config)) {
                return;
              }
              return error('NIKITA_SCHEMA_VALIDATION_CONFIG', [
                validate.errors.length === 1 ? 'one error was found in the configuration of' : 'multiple errors where found in the configuration of',
                action.metadata.namespace.length ? `action \`${action.metadata.namespace.join('.')}\`:` : "root action:",
                validate.errors.map(function(err) {
                  var key,
                msg,
                value;
                  msg = err.schemaPath + ' ' + ajv.errorsText([err]).replace(/^data/,
                'config');
                  if (err.params) {
                    msg += ((function() {
                      var ref1,
                results;
                      ref1 = err.params;
                      results = [];
                      for (key in ref1) {
                        value = ref1[key];
                        if (key === 'missingProperty') {
                          continue;
                        }
                        results.push(`, ${key} is ${JSON.stringify(value)}`);
                      }
                      return results;
                    })()).join('');
                  }
                  return msg;
                }).sort().join('; ') + '.'
              ]);
            }
          };
          return action;
        };
      }
    },
    'nikita:session:action': {
      after: ['@nikitajs/engine/lib/metadata/disabled', '@nikitajs/engine/lib/plugins/conditions', '@nikitajs/engine/lib/plugins/global'],
      handler: async function(action, handler) {
        var err;
        if ((action.metadata.schema != null) && !is_object_literal(action.metadata.schema)) {
          throw error('METADATA_SCHEMA_INVALID_VALUE', ["option `schema` expect an object literal value,", `got ${JSON.stringify(action.metadata.schema)} in`, action.metadata.namespace.length ? `action \`${action.metadata.namespace.join('.')}\`.` : "root action."]);
        }
        if (!action.metadata.schema) {
          return handler;
        }
        err = (await action.tools.schema.validate(action, action.metadata.schema));
        if (err) {
          throw err;
        } else {
          return handler;
        }
      }
    }
  }
};
