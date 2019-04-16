
# `nikita.lxd.file.push`

Push files into containers.

## Options

* `container` (string, required)
  The name of the container.
* `content` (string, optional*)
  Content of the target file; required if `source` is not set
* `create_dirs` (boolean, optional, false)
  Create any directories necessary.
* `gid` (integer, optional)
  Set the file's gid on push.
  overwrite the `source` option.
* `lxd_target` (string, required)
  File destination in the form of "[<remote>:]<container>/<path>",
  overwrite the `target` option.
* `mode` (integer|string, optional)
  Set the file's perms on push.
* `source` (string, optional*)
  File to push in the form of "<path>"; required if `content` is not set.
* `target` (string, required)
  File destination in the form of "<path>".
* `uid` (integer, optional)
  Set the file's uid on push.

## Example

```js
require('nikita')
.lxd.file.push({
  container: "my_container"
}, function(err, {status}) {
  console.info( err ? err.message : 'The container was deleted')
});
```

## Todo

* Push recursive directories
* Handle unmatched target permissions
* Handle unmatched target ownerships
* Detect name from lxd_target

## Source Code

    module.exports =  ({options}) ->
      @log message: "Entering lxd.file.push", level: 'DEBUG', module: '@nikitajs/lxd/lib/file/push'
      throw Error "Invalid Option: name is required" unless options.container # note, name could be obtained from lxd_target
      throw Error "Invalid Option: source or content are required" unless options.source or options.content?
      throw Error "Invalid Option: target is required" if not options.target and not options.lxd_target
      options.algo ?= 'md5'
      options.lxd_target ?= "#{path.join options.container, options.target}"
      options.tmp_file ?= "/tmp/nikita.#{Date.now()}#{Math.round(Math.random()*1000)}"
      # Execution
      @fs.writeFile
        if: options.content?
        target: options.tmp_file
        content: options.content
      @lxd.running
        container: options.container
      @system.execute
        if: -> @status -1
        cmd: """
        # Ensure source is a file
        [ -f "#{options.source or options.tmp_file}" ] || exit 2
        command -v openssl >/dev/null || exit 3
        sourceDgst=`openssl dgst -#{options.algo} #{options.source or options.tmp_file} | sed 's/^.* \\([a-z0-9]*\\)$/\\1/g'`
        # Get target hash
        targetDgst=`cat <<EOF | lxc exec #{options.container} -- bash
        # Ensure openssl is available
        command -v openssl >/dev/null || exit 4
        # Target does not exist
        [ ! -f "#{options.target}" ] && exit 0
        openssl dgst -#{options.algo} #{options.target} | sed 's/^.* \\([a-z0-9]*\\)$/\\1/g'
        EOF`
        [ "$sourceDgst" != "$targetDgst" ] || exit 42
        """
        code_skipped: 42
        trap: true
      , (err) ->
        throw Error "Invalid Option: source is not a file, got #{JSON.stringify options.source or options.tmp_file}" if err?.code is 2
        throw Error "Invalid Requirement: openssl not installed on host" if err?.code is 3
        throw Error "Invalid Requirement: openssl not installed on container" if err?.code is 4
      @system.execute
        if: -> not @status(-2) or @status(-1)
        cmd: """
        #{[
          'lxc', 'file', 'push'
          options.source or options.tmp_file
          options.lxd_target
          '--create-dirs' if options.create_dirs
          '--gid' if options.gid? and typeof options.gid is 'number'
          '--uid' if options.uid? and typeof options.uid is 'number'
          "--mode #{options.mode}" if options.mode
        ].join ' '}
        """
        trap: true
        trim: true
      @lxd.exec
        if: typeof options.gid is 'string'
        container: options.container
        cmd: "chgrp #{options.gid} #{options.target}"
      @lxd.exec
        if: typeof options.uid is 'string'
        container: options.container
        cmd: "chown #{options.uid} #{options.target}"
      @fs.unlink
        if: options.content?
        target: options.tmp_file
        tolerant: true # TODO, not yet implemented

## Dependencies

    path = require 'path'
