
# `nikita.file.ini(options, callback)`

Write an object as .ini file. Note, we are internally using the [ini] module.
However, there is a subtile difference. Any key provided with value of 
`undefined` or `null` will be disregarded. Within a `merge`, it get more
prowerfull and tricky: the original value will be kept if `undefined` is
provided while the value will be removed if `null` is provided.

The `file.ini` function rely on the `file` function and accept all of its
options. It introduces the `merge` option which instruct to read the
target file if it exists and merge its parsed object with the one
provided in the `content` option.

## Options   

* `backup` (string|boolean)   
  Create a backup, append a provided string to the filename extension or a
  timestamp if value is not a string, only apply if the target file exists and
  is modified.
* `clean`   
  Remove all the lines whithout a key and a value, default to "true".
* `content` (object)   
  Object to stringify.
* `escape` (boolean)   
  Escape the section's header title replace '.' by '\.'; "true" by default.
* `merge`   
  Read the target if it exists and merge its content.
* `parse`   
  User-defined function to parse the content from ini format, default to
  `require('ini').parse`, see 'misc.ini.parse_multi_brackets'.
* `separator`   
  Default separator between keys and values, default to " : ".
* `stringify`   
  User-defined function to stringify the content to ini format, default to
  `require('ini').stringify`, see 'misc.ini.stringify_square_then_curly' for
  an example.
* `eol` (string)   
  Characters for line delimiter, usage depends on the stringify option, with 
  the default stringify option, default to unix style if executed remotely 
  (SSH) or to the platform if executed locally ("\r\n for windows", 
  "\n" otherwise)
* `source` (string)   
  Path to a ini file providing default options; lower precedence than the
  content object; may be used conjointly with the local option; optional, use
  should_exists to enforce its presence.
* `target`   
  File path where to write content to or a callback.

## Callback parameters

* `err`   
  Error object if any.   
* `written`   
  Number of written actions with modifications.   

## Example

```js
require('nikita').ini({
  content: {
    'my_key': 'my value'
  },
  target: '/tmp/my_file'
}, function(err, written){
  console.log(err ? err.message : 'Content was updated: ' + !!written);
});
```

## Source Code

    module.exports = (options) ->
      @log message: "Entering file.ini", level: 'DEBUG', module: 'nikita/lib/file/ini'
      # Normalization
      options.clean ?= true
      options.escape ?= true
      options.content ?= {}
      options.encoding ?= 'utf8'
      # Validation
      throw Error "Required Option: one of 'content' or 'source' is mandatory" unless options.content or not options.source
      throw Error "Required Option: option 'target' is mandatory" unless options.target
      org_props = {}
      default_props = {}
      parse = options.parse or misc.ini.parse
      # Original properties
      @fs.readFile
        ssh: options.ssh
        target: options.target
        encoding: options.encoding
        relax: true
      , (err, {data}) ->
        return if err?.code is 'ENOENT'
        throw err if err
        org_props = misc.merge parse(data, options)
      # Default properties
      @fs.readFile
        if: options.source
        ssh: if options.local then false else options.ssh
        target: options.source
        encoding: options.encoding
        relax: true
      , (err, {data}) ->
        return if err?.code is 'ENOENT'
        throw err if err
        return unless options.source
        content = misc.ini.clean options.content, true
        options.content = misc.merge parse(data, options), options.content
      # Merge
      @call if: options.merge , (_, callback) ->
        options.content = misc.merge org_props, options.content
        @log message: "Get content for merge", level: 'DEBUG', module: 'nikita/lib/file/ini'
        callback()
      @call ->
        if options.clean
          @log message: "Clean content", level: 'INFO', module: 'nikita/lib/file/ini'
          misc.ini.clean options.content
        @log message: "Serialize content", level: 'DEBUG', module: 'nikita/lib/file/ini'
        stringify = options.stringify or misc.ini.stringify
        @file
          target: options.target
          content: stringify options.content, options
          backup: options.backup
          diff: options.diff
          eof: options.eof
          gid: options.gid
          uid: options.uid
          mode: options.mode

## Dependencies

    misc = require '../misc'
    {merge} = require '../misc'

[ini]: https://github.com/isaacs/ini
