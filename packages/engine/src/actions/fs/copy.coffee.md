
# `nikita.fs.copy`

Copy a file. The behavior is similar to the one of the `cp`
Unix utility. Copying a file over an existing file will
overwrite it.

## Callback Parameters

* `err`   
  Error object if any.   
* `status`   
  Value is "true" if copied file was created or modified.   

## Todo

* Apply permissions to directories
* Handle symlinks
* Handle globing
* Preserve permissions if `mode` is `true`

## Example

```js
require('nikita').fs.copy({
  source: '/etc/passwd',
  target: '/etc/passwd.bck',
  uid: 'my_user'
  gid: 'my_group'
  mode: '0755'
}, function(err, {status}){
  console.info(err ? err.message : 'File was copied: ' + status);
});
```

## Hook

    on_action = ({config, metadata}) ->
      config.uid = parseInt config.uid if (typeof config.uid is 'string') and /\d+/.test config.uid
      config.gid = parseInt config.gid if (typeof config.gid is 'string') and /\d+/.test config.gid
      config.parent ?= {}
      config.parent = {} if config.parent is true

## Schema

    schema =
      type: 'object'
      properties:
        'gid':
          type: 'integer'
          description: """
          Unix group name or id who owns the target file.
          """
        'mode':
          oneOf: [{type: 'integer'}, {type: 'string'}]
          # default: 0o755
          description: """
          Permissions of the file or the parent directory.. Modes may be
          absolute or symbolic. An absolute mode is an octal number. A symbolic
          mode is a string with a particular syntax describing `who`, `op` and
          `perm` symbols.
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
          system config if "true", supported attributes include 'mode', 'uid', 'gid', 
          'size', 'atime', and 'mtime'.
          """
        'preserve':
          type: 'boolean'
          default: false
          description: """
          Preserve file ownerships and permissions.
          """
        'source':
          type: 'string'
          description: """
          The file or directory to copy.
          """
        'source_stats':
          type: 'object'
          description: """
          Short-circuit to prevent source stat retrieval if already at our disposal.
          """
          properties: require('./base/stat').schema_output.properties.stats.properties
        'target':
          type: 'string'
          description: """
          Where the file or directory is copied.
          """
        'target_stats':
          type: 'object'
          description: """
          Short-circuit to prevent target stat retrieval if already at our disposal.
          """
          properties: require('./base/stat').schema_output.properties.stats.properties
        'uid':
          type: 'integer'
          description: """
          Unix user name or id who owns the target file.
          """ 
      required: ['source', 'target']      

## Handler

    handler = ({config, operations: {status, path}}) ->
      # Retrieve stats information about the source unless provided through the "source_stats" option.
      if config.source_stats
        @log message: "Source Stats: using short circuit", level: 'DEBUG', module: 'nikita/lib/system/copy'
        source_stats = config.source_stats
      else
        @log message: "Stats source file #{config.source}", level: 'DEBUG', module: 'nikita/lib/system/copy'
        {stats: source_stats} = await @fs.base.stat target: config.source
      # Retrieve stat information about the traget unless provided through the "target_stats" option.
      if config.target_stats
        @log message: "Target Stats: using short circuit", level: 'DEBUG', module: 'nikita/lib/system/copy'
        target_stats = config.target_stats
      else
        @log message: "Stats target file #{config.target}", level: 'DEBUG', module: 'nikita/lib/system/copy'
        try
          {stats: target_stats} = await @fs.base.stat target: config.target
        catch err
          # Target file doesn't necessarily exist
          throw err unless err.code is 'NIKITA_FS_STAT_TARGET_ENOENT'
      # Create target parent directory if target does not exists and if the "parent"
      # config is set to "true" (default) or as an object.
      @fs.mkdir
        if: !!config.parent
        unless: target_stats
        target: path.dirname config.target
        shy: true
      , config.parent
      # Stop here if source is a directory. We traverse all its children
      # Recursively, calling either `fs.mkdir` or `fs.copy`.
      # Like with the Unix `cp` command, ending slash matters if the target directory 
      # exists. Let's consider a source directory "/tmp/a_source" and a target directory
      # "/tmp/a_target". Without an ending slash , the directory "/tmp/a_source" is 
      # copied into "/tmp/a_target/a_source". With an ending slash, all the files
      # present inside "/tmp/a_source" are copied inside "/tmp/a_target".
      res = await @call shy: true, ->
        return unless utils.stats.isDirectory source_stats.mode
        sourceEndWithSlash = config.source.lastIndexOf('/') is config.source.length - 1
        if target_stats and not sourceEndWithSlash
          config.target = path.resolve config.target, path.basename config.source
        @log message: "Source is a directory", level: 'INFO', module: 'nikita/lib/system/copy'
        {files} = await @fs.glob "#{config.source}/**", dot: true
        for source in files then do (source) =>
          target = path.resolve config.target, path.relative config.source, source
          {stats} = await @fs.base.stat target: source
          uid = config.uid
          uid ?= stats.uid if config.preserve
          gid = config.gid
          gid ?= stats.gid if config.preserve
          mode = config.mode
          mode ?= stats.mode if config.preserve
          if utils.stats.isDirectory stats.mode
            @fs.mkdir
              target: target
              uid: uid
              gid: gid
              mode: mode
          else
            @fs.copy
              target: target
              source: source
              source_stat: stats
              uid: uid
              gid: gid
              mode: mode
        end: true
      return res.status if res.end
      # If source is a file and target is a directory, then transform target into a file.
      @call shy: true, ->
        return unless target_stats and utils.stats.isDirectory target_stats.mode
        config.target = path.resolve config.target, path.basename config.source
      # Compute the source and target hash
      {hash} = await @fs.hash config.source
      hash_source = hash
      try
        {hash} = await @fs.hash config.target
        hash_target = hash
      catch err
        throw err unless err.code is 'NIKITA_FS_STAT_TARGET_ENOENT'
      # Copy a file if content match with source
      if hash_source is hash_target
        @log message: "Hash matches as '#{hash_source}'", level: 'INFO', module: 'nikita/lib/file/download' 
      else
        @log message: "Hash dont match, source is '#{hash_source}' and target is '#{hash_target}'", level: 'WARN', module: 'nikita/lib/file/download'
        await @fs.base.copy
          source: config.source
          target: config.target
        @log message: "File copied from #{config.source} into #{config.target}", level: 'INFO', module: 'nikita/lib/system/copy' if status
      # File ownership and permissions
      config.uid ?= source_stats.uid if config.preserve
      config.gid ?= source_stats.gid if config.preserve
      config.mode ?= source_stats.mode if config.preserve
      @fs.chown
        target: config.target
        stats: target_stats
        uid: config.uid
        gid: config.gid
        if: config.uid? or config.gid?
      @fs.chmod
        target: config.target
        stats: target_stats
        mode: config.mode
        if: config.mode?
      {}

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      schema: schema

## Dependencies

    utils = require '../../utils'
