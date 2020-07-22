
# `nikita.file.cson`

## Callback parameters

* `err`   
  Error object if any.   
* `written`   
  Number of written actions with modifications.   

## Example

```js
require('nikita')
.file.yaml({
  content: {
    'my_key': 'my value'
  },
  target: '/tmp/my_file'
}, function(err, {status}){
  console.log(err ? err.message : 'Content was updated: ' + status);
});
```

## On config

    on_action = ({config, metadata}) ->
      # Validate parameters
      throw Error 'Required Option: content' unless config.content
      throw Error 'Required Option: target' unless config.target
      # config
      config.line_width ?= 160
      config.clean ?= true
      config.encoding ?= 'utf8'

## Schema

    schema =
      type: 'object'
      properties:
        'backup':
          oneOf:[{type: 'string'}, {typeof: 'boolean'}]
          description: """
          Create a backup, append a provided string to the filename extension or a
          timestamp if value is not a string, only apply if the target file exists and
          is modified.
          """
        'content':
          type: 'object'
          description: """
          Object to stringify.   
          """
        'target':
          type: 'string'
          description: """
          File path where to write content to or a callback.   
          """
        'merge':
          type: 'boolean'
          description: """
          Read the target if it exists and merge its content.
          """

## Source Code

    handler = ({config, log, metadata, operations: {status}, ssh}) ->
      log message: "Entering file.yaml", level: 'DEBUG', module: 'nikita/lib/file/yaml'
      # SSH connection
      ssh = @ssh config.ssh
      # Start real work
      @call if: config.merge, ->
        log message: "Get Target Content", level: 'DEBUG', module: 'nikita/lib/file/cson'
        try
          data = await @fs.base.readFile
            target: config.target
            encoding: config.encoding
          data = season.parse data
          config.content = merge data, config.content
          log message: "Target Merged", level: 'DEBUG', module: 'nikita/lib/file/cson'
        catch err
          if not err.code is 'NIKITA_FS_CRS_TARGET_ENOENT'
            throw err
          # File does not exists, this is ok, there is simply nothing to merge
          log message: "No Target To Merged", level: 'DEBUG', module: 'nikita/lib/file/cson'
      @call ->
        log message: "Serialize Content", level: 'DEBUG', module: 'nikita/lib/file/cson'
        @file
          content: season.stringify config.content
          target: config.target
          backup: config.backup

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      schema: schema

## Dependencies

    {merge} = require 'mixme'
    season = require 'season'

## Resources

[season]: https://www.npmjs.com/package/season