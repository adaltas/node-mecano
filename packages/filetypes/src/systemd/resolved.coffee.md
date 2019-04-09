
# `resolved.coffee.md`

## Options

* `rootdir` (string)   
  Path to the mount point corresponding to the root directory, optional.
* `reload` (boolean, optional, null)   
  Defaults to true. If set to true the following command will be executed
  `systemctl daemon-reload && systemctl restart systemd-resolved` after having
  wrote the configuration file.

This action uses `filetypes.file.ini` internally, therefore it honors all
arguments it provides. `backup` is true by default and `separator` is
overridden by "=".

## Example

Overwrite `/usr/lib/systemd/resolved.conf.d/10_resolved.conf` in `/mnt` to set
a list of fallback dns servers by using an array and set ReadEtcHosts to true.

```javascript
require("nikita").file.types.systemd.resolved({
  target: "/etc/systemd/resolved.conf",
  rootdir: "/mnt",
  content:
    FallbackDNS: ["1.1.1.1", "9.9.9.10", "8.8.8.8", "2606:4700:4700::1111"]
    ReadEtcHosts: true
})
```

Write to the default target file (`/etc/systemd/resolved.conf`). Set a single
DNS server using a string and also modify the value of DNSSEC.  Note: with
`merge` set to true, this wont overwrite the target file, only specified values
will be updated.

```javascript
require("nikita").file.types.systemd.resolved({
  content:
    DNS: "ns0.fdn.fr"
    DNSSEC: "allow-downgrade"
  merge: true
})
```

## Implementation details

The resolved configuration file requires all its fields to be under a single
section called "Time". Thus, everything in `content` will be automatically put
under a "Time" key so that the user doesn't have to do it manually.

    module.exports = ({options}) ->
      @log message: "Entering file.types.resolved", level: "DEBUG", module: "nikita/lib/file/types/systemd"
      # Options
      options.target ?= "/usr/lib/systemd/resolved.conf.d/resolved.conf"
      options.target = "#{path.join options.rootdir, options.target}" if options.rootdir
      options.generate ?= null
      if Array.isArray options.content.DNS
        options.content.DNS = options.content.DNS.join " "
      if Array.isArray options.content.FallbackDNS
        options.content.FallbackDNS = options.content.FallbackDNS.join " "
      if Array.isArray options.content.Domains
        options.content.Domains = options.content.Domains.join " "
      options.content = 'Resolve': options.content
      reload = options.reload
      options.rootdir = null
      options.reload = null
      options.backup ?= true
      options.separator = "="
      # Write configuration
      @file.ini
        separator: "="
        target: options.target
        content: options.content
        merge: options.merge
      @system.execute
        if: ->
          if reload?
          then reload
          else @status -1
        sudo: true
        cmd: """
        systemctl daemon-reload
        systemctl restart systemd-resolved
        """
        trap: true

## Dependencies

    path = require "path"

