
{merge} = require 'mixme'
registry = require './registry'
schedule = require './schedule'
plugins = require './plugins'
args_to_actions = require './args_to_actions'
error = require './utils/error'

session = (action={}) ->
  action = merge
    metadata:
      namespace: []
    state:
      namespace: []
  , action
  # Catch calls to new actions
  on_call = (...args) ->
    # Extract action namespace and reset the state
    namespace = action.state.namespace.slice()
    action.state.namespace = []
    prom = action.scheduler.add ->
      # Validate the namespace
      unless action.registry.registered namespace
        return Promise.reject error 'ACTION_UNREGISTERED_NAMESPACE', [
          'no action is registered under this namespace,'
          "got #{JSON.stringify namespace}."
        ]
      args = [...args, parent: action, metadata: namespace: namespace]
      args_is_array = args.some (arg) -> Array.isArray arg
      actions = args_to_actions.build args
      unless args_is_array
      then session actions[0]
      else actions.map (action) -> -> session action
    new Proxy prom, get: on_get
  # Building the namespace before calling an action
  on_get = (target, name) ->
    if target[name]? and not action.registry.registered name
      if typeof target[name] is 'function'
        return target[name].bind target
      else
        return target[name]
    if action.state.namespace.length is 0
      switch name
        when 'plugins' then return action.plugins
    action.state.namespace.push name
    new Proxy on_call, get: on_get
  # Initialize the plugins manager
  action.plugins = plugins
    plugins: action.plugins
    chain: new Proxy on_call, get: on_get
    parent: if action.parent then action.parent.plugins else undefined
    action: action
  # Initialize the registry to manage action registration
  action.registry = registry.create
    plugins: action.plugins
    parent: if action.parent then action.parent.registry else registry
    on_register: (name, act) ->
      await action.plugins.hook
        name: 'nikita:registry:action:register'
        args:
          name: name
          action: act
  # Register run helper
  action.run = ->
    run parent: action, ...arguments
  # Local scheduler
  action.scheduler = schedule()
  setImmediate ->
    action.scheduler.pump()
  # Expose the action context
  action.context = new Proxy on_call, get: on_get
  # Execute the action
  result = new Promise (resolve, reject) ->
    # Make sure the promise is resolved after the scheduler and its children
    on_end = new Promise (resolve, reject) ->
      action.scheduler.on_end resolve
    # Hook intented to modify the current action being created
    action = await action.plugins.hook
      name: 'nikita:session:normalize'
      args: action
      hooks: action.hooks?.on_normalize or action.on_normalize
      handler: (action) ->
        args_to_actions.normalize action
    # Load action from registry
    if action.metadata.namespace
      action_from_registry = action.registry.get action.metadata.namespace
      # Merge the registry action with the user action properties
      action = merge action_from_registry, action
    try
      # Hook attented to alter the execution of an action handler
      await action.plugins.hook
        name: 'nikita:session:action'
        args: action
        hooks: action.hooks.on_action
        silent: true # TODO: support undefined handler in plugins
      output = action.plugins.hook
        name: 'nikita:session:handler:call'
        # promisify: true # TODO: convert output and error to promises unless already one
        args:
          action: action
        handler: ({action}) ->
          action.handler.call action.context, action
      unless output and output.then
        output = new Promise (resolve, reject) ->
          resolve output
      Promise.all([output, on_end])
      .then (values) ->
        action.output = values.shift()
        resolve action.output
      , (err) ->
        action.error = err
        reject err
    catch err
      action.error = err
      reject err
  # Returning a proxified promise:
  # - news action can be registered to it as long as the promised has not fulfilled
  # - resolve when all registered actions are fulfilled
  # - resolved with the result of handler
  new Proxy result, get: on_get

module.exports = run = (...args) ->
  # Are we scheduling multiple actions
  args_is_array = args.some (arg) -> Array.isArray arg
  actions = args_to_actions.build args
  proms = actions.map (action) -> session action
  if args_is_array then Promise.all(proms) else proms[0]
