
session = require '../session'

module.exports = ->
  module: '@nikitajs/engine/src/plugins/conditions_exists'
  require: [
    '@nikitajs/engine/src/plugins/conditions'
  ]
  hooks:
    'nikita:session:action':
      after: '@nikitajs/engine/src/plugins/conditions'
      before: '@nikitajs/engine/src/metadata/disabled'
      handler: (action) ->
        # return handler
        final_run = true
        for k, v of action.conditions
          continue unless handlers[k]?
          local_run = await handlers[k].call null, action
          final_run = false if local_run is false
        action.metadata.disabled = true unless final_run

handlers =
  if_exists: (action, value) ->
    final_run = true
    for condition in action.conditions.if_exists
      try
        {stats} = await session null, ({run}) ->
          run
            metadata:
              condition: true
              depth: action.metadata.depth
            parent: action
          , ->
            @fs.base.stat target: condition
      catch err
        if err.code is 'NIKITA_FS_STAT_TARGET_ENOENT'
          final_run = false
        else throw err
    final_run
  unless_exists: (action) ->
    final_run = true
    for condition in action.conditions.unless_exists
      try
        {stats} = ! await session null, ({run}) ->
          run
            metadata:
              condition: true
              depth: action.metadata.depth
            parent: action
          , ->
            @fs.base.stat target: condition
      catch err
        if err.code is 'NIKITA_FS_STAT_TARGET_ENOENT'
          final_run = false
        else throw err
    final_run
