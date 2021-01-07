// Generated by CoffeeScript 2.5.1
/*
Return events emitted inside the action

*/
var is_object_literal, path, stackTrace;

({is_object_literal} = require('mixme'));

stackTrace = require('stack-trace');

path = require('path');

module.exports = function() {
  return {
    module: '@nikitajs/engine/lib/plugins/output_logs',
    require: ['@nikitajs/engine/lib/plugins/tools_log', '@nikitajs/engine/lib/metadata/status', '@nikitajs/engine/lib/metadata/raw'],
    hooks: {
      'nikita:session:action': {
        after: '@nikitajs/engine/lib/plugins/tools_log',
        handler: function(action) {
          action.state.logs = [];
          return action.tools.log = (function(fn) {
            return function(info) {
              var frame, log;
              log = fn.call(null, info);
              if (!is_object_literal(log)) {
                // Note, log is undefined if `metadata.log` is `false`
                // or any value return by `metadata.log` when a function
                return log;
              }
              // Re-compute filename
              frame = stackTrace.get()[1];
              log.filename = frame.getFileName();
              log.file = path.basename(frame.getFileName());
              log.line = frame.getLineNumber();
              // Push log to internal state
              action.state.logs.push(log);
              return log;
            };
          })(action.tools.log);
        }
      },
      'nikita:session:result': {
        after: '@nikitajs/engine/lib/metadata/status',
        handler: function({action, output}, handler) {
          if (action.metadata.raw_output) {
            return handler;
          }
          return async function({action}) {
            output = (await handler.apply(null, arguments));
            if (is_object_literal(output)) {
              output.logs = action.state.logs;
            }
            return output;
          };
        }
      }
    }
  };
};
