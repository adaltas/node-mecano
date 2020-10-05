// Generated by CoffeeScript 2.5.1
var EventEmitter;

({EventEmitter} = require('events'));

module.exports = function() {
  return {
    module: '@nikitajs/engine/src/plugins/events',
    hooks: {
      'nikita:session:normalize': function(action, handler) {
        return function() {
          // Handler execution
          action = handler.apply(null, arguments);
          // Register function
          if (action.operations == null) {
            action.operations = {};
          }
          action.operations.events = action.parent ? action.parent.operations.events : action.operations.events = new EventEmitter();
          return action;
        };
      },
      'nikita:session:action': function(action) {
        return action.operations.events.emit('nikita:action:start', action);
      },
      'nikita:session:result': {
        after: '@nikitajs/engine/src/metadata/status',
        handler: function({action, error, output}, handler) {
          return async function({action}) {
            var err;
            try {
              output = (await handler.apply(null, arguments));
              action.operations.events.emit('nikita:action:end', action, null, output);
              return output;
            } catch (error1) {
              err = error1;
              // console.log action
              action.operations.events.emit('nikita:action:end', action, err, output);
              throw err;
            }
          };
        }
      },
      'nikita:session:resolved': function({action}) {
        return action.operations.events.emit('nikita:session:resolved', ...arguments);
      },
      'nikita:session:rejected': function({action}) {
        return action.operations.events.emit('nikita:session:rejected', ...arguments);
      }
    }
  };
};
