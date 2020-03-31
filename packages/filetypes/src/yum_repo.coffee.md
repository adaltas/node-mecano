
`nikita.file.types.yum_repo`

Yum is a packet manager for centos/redhat. It uses .repo file located in 
"/etc/yum.repos.d/" directory to configure the list of available mirrors.

## Options

This action honors all the options from "nikita.file.ini". It overwrites the
following options:

* `escape` (boolean)   
  Set to `false` instead of `true` by default.
* `parse`   
  Set to `misc.ini.parse_multi_brackets`.

## Source Code

    module.exports = ({options}) ->
      @log message: "Entering file.types.yum_repo", level: 'DEBUG', module: 'nikita/lib/file/types/yum_repo'
      throw Error "Required Option: option 'target' is mandatory" unless options.target
      # Set the targeyt directory to yum's default path if target is a file name
      options.target = path.resolve '/etc/yum.repos.d', options.target
      @file.ini
        parse: misc.ini.parse_multi_brackets
        escape: false
      , options

## Dependencies

    path = require 'path'
    misc = require '@nikitajs/core/lib/misc'