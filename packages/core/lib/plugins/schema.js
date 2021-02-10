// Generated by CoffeeScript 2.5.1
/*
The plugin enrich the config object with default values defined in the JSON
schema. Thus, it mst be defined after every module which modify the config
object.
*/
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
  name: '@nikitajs/core/lib/plugins/schema',
  hooks: {
    'nikita:normalize': {
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
            strict: true,
            // extendRefs: true
            coerceTypes: 'array',
            loadSchema: function(uri) {
              return new Promise(async function(accept, reject) {
                var err, module, pathname, protocol;
                ({protocol, pathname} = parse(uri));
                switch (protocol) {
                  case 'module:':
                    try {
                      action = require.main.require(pathname);
                      return accept(action.metadata.schema);
                    } catch (error1) {
                      err = error1;
                      return reject(error('NIKITA_SCHEMA_INVALID_MODULE', ['the module location is not resolvable,', `module name is ${JSON.stringify(pathname)}.`]));
                    }
                    break;
                  case 'registry:':
                    module = pathname.split('/');
                    action = (await action.registry.get(module));
                    if (action) {
                      return accept(action.metadata.schema);
                    } else {
                      return reject(error('NIKITA_SCHEMA_UNREGISTERED_ACTION', ['the action is not registered inside the Nikita registry,', `action namespace is ${JSON.stringify(module.join('.'))}.`]));
                    }
                }
              });
            }
          });
          ajv_keywords(ajv);
          ajv_formats(ajv);
          ajv.addKeyword({
            keyword: "filemode",
            type: ['integer', 'string'],
            compile: function(value) {
              return function(data, schema, parentData) {
                if (typeof data === 'string' && /^\d+$/.test(data)) {
                  schema.parentData[schema.parentDataProperty] = parseInt(data, 8);
                }
                return true;
              };
            },
            metaSchema: {
              type: 'boolean',
              enum: [true]
            }
          });
          action.tools.schema = {
            ajv: ajv,
            add: function(schema, name) {
              if (!schema) {
                return;
              }
              return ajv.addSchema(schema, name);
            },
            validate: async function(action) {
              var err, validate;
              try {
                validate = (await ajv.compileAsync(action.metadata.schema));
              } catch (error1) {
                err = error1;
                if (!err.code) {
                  err.code = 'NIKITA_SCHEMA_INVALID_DEFINITION';
                  err.message = `${err.code}: ${err.message}`;
                }
                throw err;
              }
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
    'nikita:action': {
      after: ['@nikitajs/core/lib/plugins/global'],
      handler: async function(action, handler) {
        var err;
        if ((action.metadata.schema != null) && !is_object_literal(action.metadata.schema)) {
          throw error('METADATA_SCHEMA_INVALID_VALUE', ["option `schema` expect an object literal value,", `got ${JSON.stringify(action.metadata.schema)} in`, action.metadata.namespace.length ? `action \`${action.metadata.namespace.join('.')}\`.` : "root action."]);
        }
        if (!action.metadata.schema) {
          return handler;
        }
        err = (await action.tools.schema.validate(action));
        return function() {
          if (err) {
            throw err;
          }
          return handler.apply(null, arguments);
        };
      }
    }
  }
};
