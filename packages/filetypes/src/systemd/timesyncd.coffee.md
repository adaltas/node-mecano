
# `timesyncd.coffee.md`

## Options

* `rootdir` (string)   
  Path to the mount point corresponding to the root directory, optional.
* `reload` (boolean, optional, null)   
  Defaults to true. If set to true the following command will be executed
  `systemctl daemon-reload && systemctl restart systemd-timesyncd` after having
  wrote the configuration file.

This action uses `filetypes.file.ini` internally, therefore it honors all
arguments it provides. `backup` is true by default and `separator` is
overridden by "=".

## Example

Overwrite `/usr/lib/systemd/timesyncd.conf.d/10_timesyncd.conf` in `/mnt` to
set a list of NTP servers by using an array and a single fallback server by
using a string.

```javascript
require("nikita").file.types.systemd.timesyncd({
  target: "/usr/lib/systemd/timesyncd.conf.d/10_timesyncd.conf",
  rootdir: "/mnt",
  content:
    NTP: ["ntp.domain.com", "ntp.domain2.com", "ntp.domain3.com"]
    FallbackNTP: "fallback.domain.com"
})
```

Write to the default target file (`/etc/systemd/timesyncd.conf`). Set a single
NTP server using a string and also modify the value of RootDistanceMaxSec.
Note: with `merge` set to true, this wont overwrite the target file, only
specified values will be updated.

```javascript
require("nikita").file.types.systemd.timesyncd({
  content:
    NTP: "0.arch.pool.ntp.org"
    RootDistanceMaxSec: 5
  merge: true
})
```

## Implementation details

The timesyncd configuration file requires all its fields to be under a single
section called "Time". Thus, everything in `content` will be automatically put
under a "Time" key so that the user doesn't have to do it manually.

    module.exports = ({options}) ->
      @log message: "Entering file.types.timesyncd", level: "DEBUG", module: "nikita/lib/file/types/systemd"
      # Options
      options.target ?= "/etc/systemd/timesyncd.conf"
      options.target = "#{path.join options.rootdir, options.target}" if options.rootdir
      options.generate ?= null
      if Array.isArray options.content.NTP
        options.content.NTP = options.content.NTP.join " "
      if Array.isArray options.content.FallbackNTP
        options.content.FallbackNTP = options.content.FallbackNTP.join " "
      options.content = 'Time': options.content
      reload = options.reload
      options.rootdir = null
      options.reload = null
      options.backup ?= true
      options.separator = "="
      # Write configuration
      @file.ini options
      @system.execute
        if: ->
          if reload?
          then reload
          else @status -1
        sudo: true
        cmd: """
        systemctl daemon-reload
        systemctl restart systemd-timesyncd
        """
        trap: true

## Dependencies

    path = require "path"

