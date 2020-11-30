
# `nikita.ipa.group.exists`

Check if a group exists inside FreeIPA.

## Example

```js
const {status} = await nikita.ipa.group.exists({
  cn: 'somegroup',
  connection: {
    url: "https://ipa.domain.com/ipa/session/json",
    principal: "admin@DOMAIN.COM",
    password: "mysecret"
  }
})
console.info(`Group exists: ${status}`)
```

## Schema

    schema =
      type: 'object'
      properties:
        'cn':
          type: 'string'
          description: """
          Name of the group to check for existence.
          """
        'connection':
          $ref: 'module://@nikitajs/network/src/http'
          required: ['principal', 'password']
      required: ['cn', 'connection']

## Handler

    handler = ({config}) ->
      config.connection.http_headers['Referer'] ?= config.connection.referer or config.connection.url
      try
        await @ipa.group.show
          connection: config.connection
          cn: config.cn
        status: true, exists: true
      catch err
        throw err if err.code isnt 4001 # group not found
        status: false, exists: false
      

## Export

    module.exports =
      handler: handler
      schema: schema
      shy: true
