
# `nikita.lxd.init`

Initialize a Linux Container with given image name, container name and options.

## Options

* `image` (required, string)
  The image the container will use, name:[version] e.g: ubuntu:16.04
* `container` (required, string)
  The name of the container
* `network` (optional, string, )
  Network name to add to the container (see lxd.network)
* `storage` (optional, string, [default_storage])
  Storage name where to store the container
* `profile` (optional, string, default)
  Profile to set this container up
* `ephemeral` (optional, boolean, false)
  If true, the container will be deleted when stopped
* `vm` (optional, boolean, false)
  If true, instantiate a VM instead of a container
* `target` (optional, string)
  If the LXC is clustered, instantiate the container on a specific node

## Callback Parameters

* `err`
  Error object if any
* `info.status`
  Was the container successfully created

## Example

```
require('nikita')
.lxd.init({
  image: "ubuntu:18.04",
  container: "my_container"
}, function(err, {status}) {
  console.info( err ? err.message : 'The container was created')
});
```

## Implementation details

The current version 3.18 of lxd has an issue with lxc init waiting for
configuration from stdin when there is no tty. This used to work before. Use
`[ -t 0 ] && echo 'tty' || echo 'notty'` to detect the tty. The current
fix is to prepend the init command with `echo '' | `.

## TODO

We do not honors the configuration (`-c`) argument. Use the `lxd.config.set` for
now.

## Source Code

    module.exports =  ({options}) ->
      @log message: "Entering lxd.init", level: 'DEBUG', module: '@nikitajs/lxd/lib/init'
      # Validation
      throw Error "Invalid Option: container is required" unless options.container
      validate_container_name options.container
      cmd_init = [
        'lxc', 'init', options.image, options.container
        "--network #{options.network}" if options.network
        "--storage #{options.storage}" if options.storage
        "--ephemeral" if options.ephemeral
        "--vm" if options.vm
        "--profile #{options.profile}" if options.profile
        "--target #{options.target}" if options.target
      ].join ' '
      # Execution
      @system.execute
        container: options.container
        cmd: """
        lxc remote get-default
        lxc info #{options.container} >/dev/null && exit 42
        echo '' | #{cmd_init}
        """
        code_skipped: 42

## Dependencies

    validate_container_name = require './misc/validate_container_name'
