
# `nikita.file.json(options, callback)`

## Options

* `backup` (string|boolean)   
  Create a backup, append a provided string to the filename extension or a
  timestamp if value is not a string, only apply if the target file exists and
  is modified.
* `content` (javascript)  
  The javascript code to stringify.
* `pretty` (boolean | int)  
  Prettify the JSON output, accept the number of spaces as an integer, default
  to none if false or to 2 spaces indentation if true.
* `source` (string)   
  Path to a JSON file providing default values.
* `target` (string)   
  Path to the destination file.
* `merge` (boolean)  
  Merge the user content with the content of the destination file if it
  exists.
* `transform` (function)  
  User provided function to modify the javascript before it is stringified
  into JSON.

The properties "backup", "diff", "eof", "gid", "uid", "mode" will
be passed to the `file` function.

## Exemple

Merge the destination file with user provided content.

```javascript
require('nikita')
.file.json({
  target: "/path/to/target.json",
  content: { preferences: { colors: 'blue' } },
  transform: function(data){
    if(data.indexOf('red') < 0){ data.push('red'); }
    return data;
  },
  merge: true,
  pretty: true
})
```

## Source Code

    module.exports = (options) ->
      @log message: "Entering file.json", level: 'DEBUG', module: 'nikita/lib/file/json'
      # Options
      options.content ?= {}
      options.pretty ?= false
      options.pretty = 2 if options.pretty is true
      options.transform ?= null
      throw Error "Required Option: the 'target' option is required" unless options.target
      throw Error "Invalid options: \"transform\"" if options.transform and typeof options.transform isnt 'function'
      @call if: options.merge, (_, callback) ->
        @fs.readFile
          ssh: options.ssh
          target: options.target
          encoding: 'utf8'
          relax: true
        , (err, {data}) ->
          return callback() if err?.code is 'ENOENT'
          options.content = merge JSON.parse(data), options.content unless err
          callback err
      @call if: options.source, (_, callback) ->
        @fs.readFile
          ssh: if options.local then false else options.ssh
          target: options.source
          encoding: 'utf8'
        , (err, {data}) ->
          options.content = merge JSON.parse(data), options.content unless err
          callback err
      @call if: options.transform, ->
        options.content = options.transform options.content
      @file
        target: options.target
        content: -> JSON.stringify options.content, null, options.pretty
        backup: options.backup
        diff: options.diff
        eof: options.eof
        gid: options.gid
        uid: options.uid
        mode: options.mode

## Dependencies

    {merge} = require '../misc'
