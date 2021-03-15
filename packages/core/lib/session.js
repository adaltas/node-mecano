// Generated by CoffeeScript 2.5.1
var contextualize, merge, normalize, plugandplay, registry, schedule, session, utils;

({merge} = require('mixme'));

registry = require('./registry');

schedule = require('./schedulers/native');

plugandplay = require('plug-and-play');

contextualize = require('./session/contextualize');

normalize = require('./session/normalize');

utils = require('./utils');

session = function(args, options = {}) {
  var action, base, namespace, on_call, on_get, plugins, ref, ref1, ref2, ref3, result, schedulers;
  // Catch calls to new actions
  namespace = [];
  on_call = function(...args) {
    var nm, prom;
    // Extract action namespace and reset the state
    [namespace, nm] = [[], namespace];
    // Schedule the action and get the result as a promise
    prom = action.scheduler.push(async function() {
      var args_is_array, child, ref;
      // Validate the namespace
      child = (await action.registry.get(nm));
      if (!child) {
        return Promise.reject(utils.error('ACTION_UNREGISTERED_NAMESPACE', ['no action is registered under this namespace,', `got ${JSON.stringify(nm)}.`]));
      }
      args_is_array = args.some(function(arg) {
        return Array.isArray(arg);
      });
      if (!args_is_array || ((ref = child.metadata) != null ? ref.raw_input : void 0)) {
        return session(args, {
          namespace: nm,
          child: child,
          parent: action
        });
      }
      // Multiply the arguments
      return schedule(utils.array.multiply(...args).map(function(args) {
        return function() {
          return session(args, {
            namespace: nm,
            child: child,
            parent: action
          });
        };
      }));
    });
    return new Proxy(prom, {
      get: on_get
    });
  };
  // Building the namespace before calling an action
  on_get = function(target, name) {
    if ((target[name] != null) && !action.registry.registered(name)) {
      if (typeof target[name] === 'function') {
        return target[name].bind(target);
      } else {
        return target[name];
      }
    }
    if (namespace.length === 0) {
      switch (name) {
        case 'plugins':
          return action.plugins;
      }
    }
    namespace.push(name);
    return new Proxy(on_call, {
      get: on_get
    });
  };
  // Initialize the plugins manager
  options.parent = options.parent || ((ref = args[0]) != null ? ref.$parent : void 0) || void 0;
  options.namespace = options.namespace || ((ref1 = args[0]) != null ? ref1.$namespace : void 0) || void 0;
  plugins = plugandplay({
    plugins: options.plugins || ((ref2 = args[0]) != null ? ref2.$plugins : void 0) || ((ref3 = args[0]) != null ? ref3.plugins : void 0),
    chain: new Proxy(on_call, {
      get: on_get
    }),
    parent: options.parent ? options.parent.plugins : void 0
  });
  // Normalize arguments
  action = plugins.call_sync({
    name: 'nikita:arguments',
    plugins: options.plugins,
    args: {
      args: args,
      ...options
    },
    handler: function({args, namespace}) {
      return contextualize([
        ...args,
        {
          $namespace: namespace
        }
      ]);
    }
  });
  action.parent = options.parent;
  action.plugins = plugins;
  if ((base = action.metadata).namespace == null) {
    base.namespace = [];
  }
  // Initialize the registry to manage action registration
  action.registry = registry.create({
    plugins: action.plugins,
    parent: action.parent ? action.parent.registry : registry,
    on_register: async function(name, act) {
      return (await action.plugins.call({
        name: 'nikita:register',
        args: {
          name: name,
          action: act
        }
      }));
    }
  });
  // Local scheduler to execute children and be notified on finish
  schedulers = {
    in: schedule(),
    out: schedule(null, {
      pause: true
    })
  };
  // Start with a paused scheduler to register actions out of the handler
  action.scheduler = schedulers.out;
  // Expose the action context
  action.context = new Proxy(on_call, {
    get: on_get
  });
  // Execute the action
  result = new Promise(async function(resolve, reject) {
    var action_from_registry, k, on_result, output, pump, ref4, v;
    // Hook intented to modify the current action being created
    action = (await action.plugins.call({
      name: 'nikita:normalize',
      args: action,
      hooks: ((ref4 = action.hooks) != null ? ref4.on_normalize : void 0) || action.on_normalize,
      handler: normalize
    }));
    // Load action from registry
    if (action.metadata.namespace) {
      action_from_registry = (await action.registry.get(action.metadata.namespace));
// Merge the registry action with the user action properties
      for (k in action_from_registry) {
        v = action_from_registry[k];
        action[k] = merge(action_from_registry[k], action[k]);
      }
    }
    // Switch the scheduler to register actions inside the handler
    action.scheduler = schedulers.in;
    // Hook attended to alter the execution of an action handler
    output = action.plugins.call({
      name: 'nikita:action',
      args: action,
      hooks: action.hooks.on_action,
      handler: function(action) {
        // Execution of an action handler
        return action.handler.call(action.context, action);
      }
    });
    // Ensure child actions are executed
    pump = function() {
      var child;
      while (child = schedulers.out.state.stack.shift()) {
        // Now that the handler has been executed,
        // import all the actions registered outside of it
        action.scheduler.state.stack.push(child);
      }
      return action.scheduler.pump();
    };
    output.then(pump, pump);
    // Make sure the promise is resolved after the scheduler and its children
    Promise.all([output, action.scheduler]).then(function(values) {
      return on_result(void 0, values.shift());
    }, function(err) {
      return on_result(err);
    });
    // Hook to catch error and format output once all children are executed
    return on_result = function(error, output) {
      return action.plugins.call({
        name: 'nikita:result',
        args: {
          action: action,
          error: error,
          output: output
        },
        hooks: action.hooks.on_result,
        handler: function({action, error, output}) {
          if (error) {
            throw error;
          } else {
            return output;
          }
        }
      }).then(resolve, reject);
    };
  });
  result.then(function(output) {
    if (action.parent !== void 0) {
      return;
    }
    return action.plugins.call({
      name: 'nikita:resolved',
      args: {
        action: action,
        output: output
      }
    });
  }, function(err) {
    if (action.parent !== void 0) {
      return;
    }
    return action.plugins.call({
      name: 'nikita:rejected',
      args: {
        action: action,
        error: err
      }
    });
  });
  // Returning a proxified promise:
  // - new actions can be registered to it as long as the promised has not fulfilled
  // - resolve when all registered actions are fulfilled
  // - resolved with the result of handler
  return new Proxy(result, {
    get: on_get
  });
};

module.exports = function(...args) {
  return session(args);
};

module.exports.with_options = function(args, options) {
  return session(args, options);
};
