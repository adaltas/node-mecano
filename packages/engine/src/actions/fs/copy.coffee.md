
# `nikita.fs.copy`

Change permissions of a file.

## Hook

    on_action = ({config, metadata}) ->
      config.target = metadata.argument if metadata.argument?

## Schema

    schema =
      type: 'object'
      properties:
        'source':
          type: 'string'
          description: """
          Source file to be copied.
          """
        'target':
          type: 'string'
          description: """
          Destination file where to copy the source file.
          """
      required: ['source', 'target']

## Handler

    handler = ({config, metadata}) ->
      @log message: "Entering fs.copy", level: 'DEBUG', module: 'nikita/lib/fs/copy'
      try
        @execute
          cmd: """
          [ ! -d `dirname "#{config.target}"` ] && exit 2
          cp #{config.source} #{config.target}
          """
          # sudo: config.sudo
          # bash: config.bash
          # arch_chroot: config.arch_chroot
      catch err
        throw err unless err.code is 2
        throw error 'NIKITA_FS_COPY_TARGET_ENOENT', [
          'fail to list files of a directory, target is invalid,'
          "got #{JSON.stringify config.target}"
        ],
          exit_code: err.code
          errno: -2
          syscall: 'open'
          path: config.target

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      metadata:
        log: false
        raw_output: true
      schema: schema

## Dependencies

    error = require '../../utils/error'
