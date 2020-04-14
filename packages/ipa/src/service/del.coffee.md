
# `nikita.ipa.service.del`

Delete a service from FreeIPA.

## Options

* `principal` (string, required)   
  Name of the user to delete, same as the username.
* `connection` (object, required)   
  See the `nikita.connection.http` action.

## Exemple

```js
require("nikita")
.ipa.service.del({
  principal: "myprincipal/my.domain.com",
  connection: {
    url: "https://ipa.domain.com/ipa/session/json",
    principal: "admin@DOMAIN.COM",
    password: "mysecret"
  }
}, function(){
  console.info(err ? err.message : status ?
    "Service deleted" : "Service does not exist")
})
```

## Schema

    schema =
      type: 'object'
      properties:
        'principal': type: 'string'
        'connection':
          $ref: '/nikita/connection/http'
      required: ['connection', 'principal']

## Handler

    handler = ({options}) ->
      options.connection.http_headers ?= {}
      options.connection.http_headers['Referer'] ?= options.connection.referer or options.connection.url
      throw Error "Required Option: principal is required, got #{options.connection.principal}" unless options.connection.principal
      throw Error "Required Option: password is required, got #{options.connection.password}" unless options.connection.password
      @ipa.service.exists
        connection: options.connection
        shy: false
        principal: options.principal
      @connection.http options.connection,
        if: -> @status(-1)
        negotiate: true
        method: 'POST'
        data:
          method: "service_del/1"
          params: [[options.principal], {}]
          id: 0
        http_headers: options.http_headers

## Export

    module.exports =
      handler: handler
      schema: schema

## Dependencies

    string = require '@nikitajs/core/lib/misc/string'
    diff = require 'object-diff'
