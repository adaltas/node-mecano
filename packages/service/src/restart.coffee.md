
# `nikita.service.restart`

Restart a service.

## Output
 
* `$status`   
  Indicates if the startup behavior has changed.   

## Example

```js
const {$status} = await nikita.service.restart([{
  name: 'gmetad'
})
console.info(`Service was restarted: ${$status}`)
```

## Schema

    schema =
      type: 'object'
      properties:
        'name':
          $ref: 'module://@nikitajs/service/src/install#/properties/name'
      required: ['name']

## Handler

    handler = ({config, parent: {state}, tools: {log}}) ->
      log message: "Restart service #{config.name}", level: 'INFO'
      {loader} = await @service.discover {}
      config.loader ?= loader
      {status} = await @execute
        command: switch config.loader
          when 'systemctl' then "systemctl restart #{config.name}"
          when 'service' then "service #{config.name} restart"
          else throw Error 'Init System not supported'
      state["nikita.service.#{config.name}.status"] = 'started' if status
      status: status

## Export

    module.exports =
      handler: handler
      metadata:
        argument_to_config: 'name'
        schema: schema
