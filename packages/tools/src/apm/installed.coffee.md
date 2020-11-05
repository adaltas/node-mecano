
# `nikita.tools.apm.installed`

Check if APM is installed and available on the system.

```js
{status} = await nikita.tools.apm.installed()
console.log(`Is APM installed: ${status}`)
```

## Source code

    handler = ->
      @execute
        cmd: "if (apm -v | grep apm) then (exit 0) else (exit 1) fi"

## Exports

    module.exports =
      handler: handler
      metadata:
        shy: true