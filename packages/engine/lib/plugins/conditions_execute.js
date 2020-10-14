// Generated by CoffeeScript 2.5.1
var handlers, session;

session = require('../session');

module.exports = function() {
  return {
    module: '@nikitajs/engine/src/plugins/conditions_execute',
    require: ['@nikitajs/engine/src/plugins/conditions'],
    hooks: {
      'nikita:session:action': {
        after: '@nikitajs/engine/src/plugins/conditions',
        before: '@nikitajs/engine/src/metadata/disabled',
        handler: async function(action) {
          var final_run, k, local_run, ref, v;
          final_run = true;
          ref = action.conditions;
          for (k in ref) {
            v = ref[k];
            if (handlers[k] == null) {
              continue;
            }
            local_run = (await handlers[k].call(null, action));
            if (local_run === false) {
              final_run = false;
            }
          }
          if (!final_run) {
            action.metadata.disabled = true;
          }
          return action;
        }
      }
    }
  };
};

handlers = {
  if_execute: async function(action, value) {
    var condition, final_run, i, len, ref;
    final_run = true;
    ref = action.conditions.if_execute;
    for (i = 0, len = ref.length; i < len; i++) {
      condition = ref[i];
      await session(null, async function({run}) {
        var status;
        ({status} = (await run({
          hooks: {
            on_result: function({action}) {
              return delete action.parent;
            }
          },
          metadata: {
            condition: true,
            depth: action.metadata.depth
          },
          parent: action,
          namespace: ['execute'],
          code_skipped: 1
        }, condition)));
        if (!status) {
          return final_run = false;
        }
      });
    }
    return final_run;
  },
  unless_execute: async function(action) {
    var condition, final_run, i, len, ref;
    final_run = true;
    ref = action.conditions.unless_execute;
    for (i = 0, len = ref.length; i < len; i++) {
      condition = ref[i];
      await session(null, async function({run}) {
        var status;
        ({status} = (await run({
          hooks: {
            on_result: function({action}) {
              return delete action.parent;
            }
          },
          metadata: {
            condition: true,
            depth: action.metadata.depth
          },
          parent: action,
          namespace: ['execute'],
          code_skipped: 1
        }, condition)));
        if (status) {
          return final_run = false;
        }
      });
    }
    return final_run;
  }
};
