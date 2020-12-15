
# `nikita.lxd.network.delete`

Delete an existing lxd network.

## Callback parameters

* `err`   
  Error object if any.
* `status`   
  True if the network was deleted.

## Example

```js
const {status} = await nikita.lxd.network.delete({
  network: 'network0'
})
console.info(`Network was deleted: ${status}`)
```

## Schema

    schema =
      type: 'object'
      properties:
        'network':
          type: 'string'
          description: """
          The network name to delete.
          """
      required: ['network']

## Handler

    handler = ({config}) ->
      # log message: "Entering lxd.network.delete", level: "DEBUG", module: "@nikitajs/lxd/lib/network/delete"
      #Execute
      @execute
        command: """
        lxc network list --format csv | grep #{config.network} || exit 42
        #{[
          'lxc'
          'network'
          'delete'
           config.network
        ].join ' '}
        """
        code_skipped: 42

## Export

    module.exports =
      handler: handler
      metadata:
        schema: schema
