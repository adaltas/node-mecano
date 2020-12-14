
# `nikita.docker.volume_create`

Create a volume.

## Callback parameters

* `err`   
  Error object if any.   
* `status`   
  True is volume was created.

## Example

```js
const {status} = await nikita.docker.volume_create({
  name: 'my_volume'
})
console.info(`Volume was created: ${status}`)
```

## Schema

    schema =
      type: 'object'
      properties:
        'driver':
          type: 'string'
          description: """
          Specify volume driver name.
          """
        'label':
          oneOf: [
            {type: 'string'}
            {type: 'array', items: type: 'string'}
          ]
          description: """
          Set metadata for a volume.
          """
        'name':
          type: 'string'
          description: """
          Specify volume name.
          """
        'opt':
          oneOf: [
            {type: 'string'}
            {type: 'array', items: type: 'string'}
          ]
          description: """
          Set driver specific options.
          """
        'boot2docker':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/boot2docker'
        'compose':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/compose'
        'machine':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/machine'

## Handler

    handler = ({config, tools: {log}}) ->
      log message: "Entering Docker volume_create", level: 'DEBUG', module: 'nikita/lib/docker/volume_create'
      # Normalize config
      config.label = [config.label] if typeof config.label is 'string'
      config.opt = [config.opt] if typeof config.opt is 'string'
      {status} = await @docker.tools.execute
        if: config.name
        command: "volume inspect #{config.name}"
        code: 1
        code_skipped: 0
        metadata: shy: true
      @docker.tools.execute
        if: -> not config.name or status
        command: [
          "volume create"
          "--driver #{config.driver}" if config.driver
          "--label #{config.label.join ','}" if config.label
          "--name #{config.name}" if config.name
          "--opt #{config.opt.join ','}" if config.opt
        ].join ' '

## Exports

    module.exports =
      handler: handler
      metadata:
        global: 'docker'
      schema: schema
