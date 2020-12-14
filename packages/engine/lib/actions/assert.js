// Generated by CoffeeScript 2.5.1
// # `nikita.assert`

// Assert an action return `true` or an array with all items equals to `true`.

// When calling children, ensure they return `true` and that the value is not altered
// with the `raw_output` metadata.

// When the `not` option is active and if an array is returned, all the items must
// equals `false` for the assertion to succeed.

// ## Casting rules

// Casting is activated by default and is disabled when the `strict` configuration
// is active.

// - Strings and buffers are `true` unless empty
// - Numbers above `0` are `true`
// - Values of `null` and `undefined` are `false`
// - Object literals are `true` if they contain keys
// - Function are invalid and throw a `NIKITA_ASSERT_INVALID_OUTPUT` error

// ## Examples

// Assert succeed when the handler return `true`:

// ```js
// nikita.assert( () => {
//   return true
// })
// ```

// Assert succeed when the handler return a promise which resolves with `true`:

// ```js
// nikita.assert( () => {
//   return new Promise( (resolve) => {
//     resolve(true)
//   })
// })
// ```

// ## Hook
var on_action, schema, utils;

on_action = function(action) {
  return action.handler = (function(handler) {
    return async function({config}) {
      var result;
      result = (await this.call({
        metadata: {
          raw_output: true
        },
        handler: handler
      }));
      if (!Array.isArray(result)) {
        result = [result];
      }
      if (!config.strict) {
        result = result.map(function(res) {
          switch (typeof res) {
            case 'undefined':
              return false;
            case 'boolean':
              return !!res;
            case 'number':
              return !!res;
            case 'string':
              return !!res.length;
            case 'object':
              if (Buffer.isBuffer(res)) {
                return !!res.length;
              } else if (res === null) {
                return false;
              } else {
                return !!Object.keys(res).length;
              }
              break;
            case 'function':
              throw utils.error('NIKITA_ASSERT_INVALID_OUTPUT', ['assertion does not accept functions']);
          }
        });
      }
      result = !result.some(function(res) {
        if (!config.not) {
          return res !== true;
        } else {
          return res === true;
        }
      });
      if (result !== true) {
        throw utils.error('NIKITA_ASSERT_UNTRUE', ['assertion did not validate,', `got ${JSON.stringify(result)}`]);
      }
    };
  })(action.handler);
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'not': {
      type: 'boolean',
      default: false,
      description: `Negates the validation.`
    },
    'strict': {
      type: 'boolean',
      default: false,
      description: `Cancel the casting of output into a boolean value.`
    }
  }
};

// ## Exports
module.exports = {
  on_action: on_action,
  schema: schema
};

// ## Dependencies
utils = require('../utils');