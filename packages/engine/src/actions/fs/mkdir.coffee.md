
# `nikita.system.mkdir`

Recursively create a directory. The behavior is similar to the Unix command
`mkdir -p`. It supports an alternative syntax where config is simply the path
of the directory to create.

## Callback Parameters

* `err`   
  Error object if any.   
* `status`   
  Value is "true" if directory was created or modified.   

## Simple usage

```js
require('nikita')
.fs.mkdir('./some/dir', function(err, {status}){
  console.info(err ? err.message : "Directory created: " + status);
});
```

## Advanced usage

```js
require('nikita')
.fs.mkdir({
  ssh: ssh,
  target: './some/dir',
  uid: 'a_user',
  gid: 'a_group'
  mode: 0o0777 // or '777'
}, function(err, {status}){
  console.info(err ? err.message : 'Directory created: ' + status);
});
```

## Hook

    on_action = ({config, metadata}) ->
      config.target = metadata.argument if metadata.argument?

## Schema

    schema =
      type: 'object'
      properties:
        'cwd':
          oneOf: [{type: 'boolean'}, {type: 'string'}]
          description: """
          Current working directory for relative paths. A boolean value only
          apply without an SSH connection and default to `process.cwd()`.
          """
        'exclude':
          instanceof: 'RegExp'
          description: """
          Exclude directories matching a regular expression. For exemple, the
          expression `/\${/` on './var/cache/${user}' exclude the directories
          containing a variables and only apply to `./var/cache/`. 
          """
        'gid':
          oneOf: [{type: 'integer'}, {type: 'string'}]
          description: """
          Unix group name or id who owns the target directory.
          """
        'mode':
          oneOf: [{type: 'integer'}, {type: 'string'}]
          # default: 0o755
          description: """
          Directory mode. Modes may be absolute or symbolic. An absolute mode is
          an octal number. A symbolic mode is a string with a particular syntax
          describing `who`, `op` and `perm` symbols.
          """
        'parent':
          oneOf: [{
            type: 'boolean'
          }, {
            type: 'object'
            properties:
              'mode':
                $ref: '#/properties/mode'
          }]
          description: """
          Create parent directory with provided attributes if an object or default 
          system options if "true", supported attributes include 'mode', 'uid', 'gid', 
          'size', 'atime', and 'mtime'.
          """
        'target':
          type: 'string'
          description: """
          Location of the directory to be created.
          """
        'uid':
          oneOf: [{type: 'integer'}, {type: 'string'}]
          description: """
          Unix user name or id who owns the target directory.
          """
      required: ['target']
        
## Handler

    handler = ({config, log, metadata, operations: {path}, ssh}) ->
      # @log message: "Entering mkdir", level: 'DEBUG', module: 'nikita/lib/system/mkdir'
      # Configuration validation
      config.cwd = process.cwd() if not ssh and (config.cwd is true or not config.cwd)
      config.parent = {} if config.parent is true
      config.target = if config.cwd then path.resolve config.cwd, config.target else path.normalize config.target
      if ssh and not path.isAbsolute config.target
        throw errors.NIKITA_MKDIR_TARGET_RELATIVE config: config
      # Retrieve every directories including parents
      parents = config.target.split path.sep
      parents.shift() # first element is empty with absolute path
      parents.pop() if parents[parents.length - 1] is ''
      parents = for i in [0...parents.length]
        '/' + parents.slice(0, parents.length - i).join '/'
      # Discovery of directories to create
      target_stats = null
      creates = []
      for target, i in parents
        try
          {stats} = await @fs.base.stat target
          target_stats = status if i is parents.length - 1
          break if utils.stats.isDirectory stats.mode
          throw errors.NIKITA_MKDIR_TARGET_INVALID_TYPE stats: stats, target: target
        catch err
          if err.code is 'NIKITA_FS_STAT_TARGET_ENOENT'
            creates.push target
          else throw err
      # Target and parent directory creation
      for target, i in creates.reverse()
        if config.exclude? and config.exclude instanceof RegExp
          break if config.exclude.test path.basename target
        opts = {}
        for attr in ['mode', 'uid', 'gid', 'size', 'atime', 'mtime']
          val = if i is creates.length - 1 then config[attr] else config.parent?[attr]
          opts[attr] = val if val?
        await @fs.base.mkdir target, opts
        log message: "Directory \"#{target}\" created ", level: 'INFO', module: 'nikita/lib/system/mkdir'
      # Target directory update
      if creates.length is 0
        log message: "Directory already exists", level: 'DEBUG', module: 'nikita/lib/system/mkdir'
        @fs.chown
          target: config.target
          stats: stats
          uid: config.uid
          gid: config.gid
          if: config.uid? or config.gid?
        @fs.chmod
          target: config.target
          stats: stats
          mode: config.mode
          if: config.mode?
      {}

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      schema: schema

## Errors

    errors =
      NIKITA_MKDIR_TARGET_RELATIVE: ({config}) ->
        error 'NIKITA_MKDIR_TARGET_RELATIVE', [
          'only absolute path are supported over SSH,'
          'target is relative and config `cwd` is not provided,'
          "got #{JSON.stringify config.target}"
        ],
          target: config.target
      NIKITA_MKDIR_TARGET_INVALID_TYPE: ({stats, target}) ->
        error 'NIKITA_MKDIR_TARGET_INVALID_TYPE', [
          'target exists but it is not a directory,'
          "got #{JSON.stringify utils.stats.type stats.mode} type"
        ],
          target: target

## Dependencies

    utils = require '../../utils'
    error = require '../../utils/error'
