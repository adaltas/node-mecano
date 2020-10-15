
# `nikita.file.upload`

Upload a file to a remote location. Options are identical to the "write"
function with the addition of the "binary" option.

## Callback parameters

* `err`   
  Error object if any.   
* `status`   
  Value is "true" if file was uploaded.   

## Example

```js
require('nikita')
.file.upload({
  ssh: ssh
  source: '/tmp/local_file',
  target: '/tmp/remote_file'
}, function(err, {status}){
  console.info(err ? err.message : 'File uploaded: ' + status);
});
```

## Schema

    schema =
      type: 'object'
      properties:
        'content':
          oneOf:[{type: 'string'}, {typeof: 'function'}]
          description: """
          Text to be written.
          """
        'from':
          oneOf: [{type: 'string'}, {instanceof: 'RegExp'}]
          description: """
          Name of the marker from where the content will be replaced.
          """
        'md5':
          oneOf:[{type: 'string'}, {typeof: 'boolean'}]
          default: false
          description: """
          Validate uploaded file with md5 checksum (only for binary upload for now),
          may be the string checksum or will be deduced from source if "true".
          """
        'sha1':
          default: false
          oneOf:[{type: 'string'}, {typeof: 'boolean'}]
          description: """
          Validate uploaded file with sha1 checksum (only for binary upload for now),
          may be the string checksum or will be deduced from source if "true".
          """
        'source':
          type: 'string'
          description: """
          File path from where to extract the content, do not use conjointly
          with content.
          """
        'target':
          oneOf: [{type: 'string'}, {typeof: 'function'}]
          description: """
          File path where to write content to. Pass the content.
          """
      required: ['source', 'target']

## Handler

    handler = ({config, log}) ->
      if config.md5?
        algo = 'md5'
      else if config.sha1?
        algo = 'sha1'
      else
        algo = 'md5'
      log message: "Source is \"#{config.source}\"", level: 'DEBUG', module: 'nikita/lib/file/upload'
      log message: "Destination is \"#{config.target}\"", level: 'DEBUG', module: 'nikita/lib/file/upload'
      log message: "Entering file.upload", level: 'DEBUG', module: 'nikita/lib/file/upload'
      # Stat the target and redefine its path if a directory
      stats = await @call raw_output: true, ->
        try
          {stats} = await @fs.base.stat ssh: false, sudo: false, target: config.target
          # Target is a file
          return stats if utils.stats.isFile stats.mode
          # Target is invalid
          throw Error "Invalid Target: expect a file, a symlink or a directory for #{JSON.stringify config.target}" unless utils.stats.isDirectory stats.mode
          # Target is a directory
          config.target = path.resolve config.target, path.basename config.source
          try
            {stats} = await @fs.base.stat ssh: false, sudo: false, target: config.target
            return stats if utils.stats.isFile stats.mode
            throw Error "Invalid target: #{config.target}"
          catch err
            return null if err.code is 'NIKITA_FS_STAT_TARGET_ENOENT'
            throw err
        catch err
          return null if err.code is 'NIKITA_FS_STAT_TARGET_ENOENT'
          throw err
      # Now that we know the real name of the target, define a temporary file to write
      stage_target = "#{config.target}.#{Date.now()}#{Math.round(Math.random()*1000)}"
      {status} = await @call ->
        return true unless stats
        {hash} = await @fs.hash target: config.source, algo: algo
        hash_source = hash
        {hash} = await @fs.hash target: config.target, algo: algo, ssh: false, sudo: false
        hash_target = hash
        match = hash_source is hash_target
        log if match
        then message: "Hash matches as '#{hash_source}'", level: 'INFO', module: 'nikita/lib/file/download' 
        else message: "Hash dont match, source is '#{hash_source}' and target is '#{hash_target}'", level: 'WARN', module: 'nikita/lib/file/download'
        not match
      return unless status
      @fs.mkdir
        ssh: false
        sudo: false
        target: path.dirname stage_target
      await @fs.base.createReadStream
        target: config.source
        stream: (rs) ->
          ws = fs.createWriteStream stage_target
          rs.pipe ws
      @fs.move
        ssh: false
        sudo: false
        source: stage_target
        target: config.target
      log message: "Unstaged uploaded file", level: 'INFO', module: 'nikita/lib/file/upload'
      if config.mode?
        @fs.chmod
          ssh: false
          sudo: false
          target: config.target
          mode: config.mode
      if config.uid? or config.gid?
        @fs.chown
          ssh: false
          sudo: false
          target: config.target
          uid: config.uid
          gid: config.gid
      {}

## Exports

    module.exports =
      handler: handler
      schema: schema

## Dependencies

    fs = require 'fs'
    path = require 'path'
    utils = require '@nikitajs/engine/src/utils'
