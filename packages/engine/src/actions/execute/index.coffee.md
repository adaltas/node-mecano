
# `nikita.execute`

Run a command locally or with ssh if `host` or `ssh` is provided.

## Exit codes

The properties "code" and "code_skipped" are important to determine whether an
action failed or succeed with or without modifications. An action is expected to
execute successfully with modifications if the exit code match one of the value
in "code", by default "0". Otherwise, it is considered to have failed and an
error is passed to the user callback. The "code_skipped" option is used to
define one or more exit codes that are considered successfull but without
creating any modifications.

## Callback parameters

* `err`   
  Error object if any.
* `info.status`   
  Value is "true" if command exit equals option "code", "0" by default, "false" if
  command exit equals option "code_skipped", none by default.
* `info.stdout`   
  Stdout value(s) unless `stdout` option is provided.
* `info.stderr`   
  Stderr value(s) unless `stderr` option is provided.

## Events

* `stdout`
* `stdout_stream`
* `stderr`
* `stderr_stream`

## Create a user over SSH

This example create a user on a remote server with the `useradd` command. It
print the error message if the command failed or an information message if it
succeed.

An exit code equal to "9" defined by the "code_skipped" option indicates that
the command is considered successfull but without any impact.

```javascript
nikita.execute({
  ssh: ssh,
  cmd: 'useradd myfriend',
  code_skipped: 9
}, function(err, {status}){
  if(err) return;
  console.info(status ? 'User created' : 'User already exists')
});
```

## Run a command with bash

```javascript
nikita.execute({
  bash: true,
  cmd: 'env'
}, function(err, {stdout}){
  console.info(err || stdout);
});
```

## Hook

    on_action = ({config, metadata}) ->
      config.cmd = metadata.argument if metadata.argument?
      config.code = [config.code] if config.code? and not Array.isArray config.code
      config.code_skipped = [config.code_skipped] if config.code_skipped? and not Array.isArray config.code_skipped

## Schema

    schema =
      type: 'object'
      properties:
        'arch_chroot':
          oneOf: [{type: 'boolean'}, {type: 'string'}]
          description: """
          Run this command inside a root directory with the arc-chroot command
          or any provided string, require the "rootdir" option if activated.
          """
        'bash':
          oneOf: [{type: 'boolean'}, {type: 'string'}]
          description: """
          Serialize the command into a file and execute it with bash.
          """
        'rootdir':
          type: 'string'
          description: """
          Path to the mount point corresponding to the root directory, required if
          the "arch_chroot" option is activated.
          """
        'cmd':
          oneOf: [{type: 'string'}, typeof: 'function']
          description: """
          String, Object or array; Command to execute. A value provided as a
          function is interpreted as an action and will be called by forwarding
          the config object. The result is the expected to be the command
          to execute.
          """
        'cwd':
          type: 'string'
          description: """
          Current working directory from where to execute the command.
          """
        'code':
          type: 'array'
          default: [0]
          items:
            type: 'integer'
          description: """
          Expected code(s) returned by the command, int or array of int, default
          to 0.
          """
        'code_skipped':
          type: 'array'
          default: []
          description: """
          Expected code(s) returned by the command if it has no effect, executed
          will not be incremented, int or array of int.
          """
        'dirty':
          type: 'boolean'
          default: false
          description: """
          Leave temporary files on the filesystem.
          """
        'trap':
          type: 'boolean'
          default: false
          description: """
          Exit immediately if a commands exits with a non-zero status.
          """
        'env':
          description: """
          Environment variables, default to `process.env`.
          """
        'gid':
          description: """
          Unix group id.
          """
        'log':
          description: """
          Function called with a log related messages.
          """
        'stdin_log':
          type: 'boolean'
          default: true
          description: """
          Log the executed command of type stdin, default is `true`.
          """
        'stdout':
          instanceof: 'Object' # must be `stream.Writable`
          description: """
          Writable EventEmitter in which the standard output of executed
          commands will be piped.
          """
        'stdout_return':
          type: 'boolean'
          default: true
          description: """
          Return the stderr content in the output, default is `true`.  It is
          preferable to set this property to `false` and to use the `stdout`
          property when expecting a large stdout output.
          """
        'stdout_log':
          type: 'boolean'
          default: true
          description: """
          Pass stdout output to the logs of type "stdout_stream", default is
          `true`.
          """
        'stdout_trim':
          type: 'boolean'
          default: false
          description: """
          Trim stdout argument passed in the callback.
          """
        'stderr':
          instanceof: 'Object' # must be `stream.Writable`
          description: """
          Writable EventEmitter in which the standard error output of executed command
          will be piped.
          """
        'stderr_return':
          type: 'boolean'
          default: true
          description: """
          Return the stderr content in the output, default is `true`. It is
          preferable to set this property to `false` and to use the `stderr`
          property when expecting a large stderr output.
          """
        'stderr_log':
          type: 'boolean'
          default: true
          description: """
          Pass stdout output to the logs of type "stdout_stream", default is `true`.
          """
        'stderr_trim':
          type: 'boolean'
          default: false
          description: """
          Trim stderr argument passed in the callback.
          """
        'sudo':
          type: 'boolean'
          # default: false
          description: """
          Run a command as sudo, desactivated if user is "root".
          """
        'target':
          type: 'string'
          description: """
          Temporary path storing the script, only apply with the `bash` and
          `arch_chroot` properties, always disposed once executed. Unless
          provided, the default location is `{metadata.tmpdir}/{string.hash
          config.cmd}`. See the `tmpdir` plugin for additionnal information.
          """
        'uid':
          type: 'integer'
          description: """
          Unix user id.
          """
      required: ['cmd']
          
## Source Code

    handler = ({config, log, metadata, operations: {find, path}, ssh}) ->
      # @log message: "Entering execute", level: 'DEBUG', module: 'nikita/lib/system/execute'
      # Validate parameters
      config.mode ?= 0o500
      config.cmd = await @call config: config, config.cmd if typeof config.cmd is 'function'
      config.bash = 'bash' if config.bash is true
      config.arch_chroot = 'arch-chroot' if config.arch_chroot is true
      config.cmd = "set -e\n#{config.cmd}" if config.cmd and config.trap
      config.cmd_original = "#{config.cmd}"
      sudo = await find ({config: {sudo}}) -> sudo
      # throw Error "Required Option: the \"cmd\" option is not provided" unless config.cmd?
      throw Error "Incompatible properties: bash, arch_chroot" if ['bash', 'arch_chroot'].filter((k) -> config[k]).length > 1
      throw Error "Required Option: \"rootdir\" with \"arch_chroot\"" if config.arch_chroot and not config.rootdir
      # Guess current username
      current_username =
        if ssh then ssh.config.username
        else if /^win/.test(process.platform) then process.env['USERPROFILE'].split(path.win32.sep)[2]
        else process.env['USER']
      # Sudo
      if sudo
        if current_username is 'root'
          sudo = false
        else
          config.bash = 'bash' unless ['bash', 'arch_chroot'].some (k) -> config[k]
      # User substitution
      # Determines if writing is required and eventually convert uid to username
      if config.uid and current_username isnt 'root' and not /\d/.test "#{config.uid}"
        {stdout} = await @execute "awk -v val=#{config.uid} -F ":" '$3==val{print $1}' /etc/passwd`", (err, {stdout}) ->
        config.uid = stdout.trim()
        config.bash = 'bash' unless config.bash or config.arch_chroot
      # Write script
      if config.bash
        cmd = config.cmd
        config.target = "#{metadata.tmpdir}/#{utils.string.hash config.cmd}" if typeof config.target isnt 'string'
        log message: "Writing bash script to #{JSON.stringify config.target}", level: 'INFO'
        config.cmd = "#{config.bash} #{config.target}"
        config.cmd = "su - #{config.uid} -c '#{config.cmd}'" if config.uid
        config.cmd += ";code=`echo $?`; rm '#{config.target}'; exit $code" unless config.dirty
        await @fs.base.writeFile
          target: config.target
          content: cmd
          uid: config.uid
          mode: config.mode
          sudo: false
      if config.arch_chroot
        cmd = config.cmd
        config.target = "#{metadata.tmpdir}/#{utils.string.hash config.cmd}" if typeof config.target isnt 'string'
        log message: "Writing arch-chroot script to #{JSON.stringify config.target}", level: 'INFO'
        config.cmd = "#{config.arch_chroot} #{config.rootdir} bash #{config.target}"
        config.cmd += ";code=`echo $?`; rm '#{path.join config.rootdir, config.target}'; exit $code" unless config.dirty
        await @fs.base.writeFile
          target: "#{path.join config.rootdir, config.target}"
          content: "#{cmd}"
          mode: config.mode
          sudo: false
      if sudo
        config.cmd = "sudo #{config.cmd}"
      # Execute
      new Promise (resolve, reject) =>
        log message: config.cmd_original, type: 'stdin', level: 'INFO', module: 'nikita/lib/system/execute' if config.stdin_log
        child = exec config, ssh: ssh
        result = stdout: [], stderr: [], code: null, status: false, command: config.cmd_original
        config.stdin.pipe child.stdin if config.stdin
        child.stdout.pipe config.stdout, end: false if config.stdout
        child.stderr.pipe config.stderr, end: false if config.stderr
        stdout_stream_open = stderr_stream_open = false
        if config.stdout_return or config.stdout_log
          child.stdout.on 'data', (data) =>
            stdout_stream_open = true if config.stdout_log
            log message: data, type: 'stdout_stream', module: 'nikita/lib/system/execute' if config.stdout_log
            if config.stdout_return
              if Array.isArray result.stdout # A string once `exit` is called
                result.stdout.push data
              else console.warn [
                'NIKITA_EXECUTE_STDOUT_INVALID:'
                'stdout coming after child exit,'
                "got #{JSON.stringify data.toString()},"
                'this is embarassing and we never found how to catch this bug,'
                'we would really enjoy some help to replicate or fix this one.'
              ].join ' '
        if config.stderr_return or config.stderr_log
          child.stderr.on 'data', (data) =>
            stderr_stream_open = true if config.stderr_log
            log message: data, type: 'stderr_stream', module: 'nikita/lib/system/execute' if config.stderr_log
            if config.stderr_return
              if Array.isArray result.stderr # A string once `exit` is called
                result.stderr.push data
              else console.warn [
                'NIKITA_EXECUTE_STDERR_INVALID:'
                'stderr coming after child exit,'
                "got #{JSON.stringify data.toString()},"
                'this is embarassing and we never found how to catch this bug,'
                'we would really enjoy some help to replicate or fix this one.'
              ].join ' '
        child.on "exit", (code) =>
          result.code = code
          # Give it some time because the "exit" event is sometimes
          # called before the "stdout" "data" event when running
          # `npm test`
          setTimeout =>
            log message: null, type: 'stdout_stream', module: 'nikita/lib/system/execute' if stdout_stream_open and config.stdout_log
            log message: null, type: 'stderr_stream', module: 'nikita/lib/system/execute' if  stderr_stream_open and config.stderr_log
            result.stdout = result.stdout.map((d) -> d.toString()).join('')
            result.stdout = result.stdout.trim() if config.trim or config.stdout_trim
            result.stderr = result.stderr.map((d) -> d.toString()).join('')
            result.stderr = result.stderr.trim() if config.trim or config.stderr_trim
            log message: result.stdout, type: 'stdout', module: 'nikita/lib/system/execute' if result.stdout and result.stdout isnt '' and config.stdout_log
            log message: result.stderr, type: 'stderr', module: 'nikita/lib/system/execute' if result.stderr and result.stderr isnt '' and config.stderr_log
            if config.stdout
              child.stdout.unpipe config.stdout
            if config.stderr
              child.stderr.unpipe config.stderr
            if config.code.indexOf(code) is -1 and config.code_skipped.indexOf(code) is -1
              return reject error 'NIKITA_EXECUTE_EXIT_CODE_INVALID', [
                'an unexpected exit code was encountered,'
                "command is #{JSON.stringify utils.string.max config.cmd_original, 50}"
                "got #{JSON.stringify result.code}"
                if config.code.length is 1
                then "instead of #{config.code}."
                else "while expecting one of #{JSON.stringify config.code}."
              ], {...result, exit_code: code}
            if config.code_skipped.indexOf(code) is -1
              result.status = true
            else
              log message: "Skip exit code \"#{code}\"", level: 'INFO', module: 'nikita/lib/system/execute'
            resolve result
          , 1

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      metadata:
        tmpdir: true
      schema: schema

## Dependencies

    exec = require 'ssh2-exec'
    utils = require '../../utils'
    error = require '../../utils/error'
