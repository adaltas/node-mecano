
http = require 'http'
path = require 'path'
nikita = require '@nikitajs/engine/src'
{tags, ssh, tmpdir} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'file.cache file', ->

  they 'current cache file match provided hash', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @log.fs
        basedir: tmpdir
        serializer: text: (log) -> "#{log.message}\n"
      @file
        target: "#{tmpdir}/my_file"
        content: 'okay'
      @file
        target: "#{tmpdir}/my_cache_file"
        content: 'okay'
      @file.cache
        source: "#{tmpdir}/my_file"
        cache_file: "#{tmpdir}/my_cache_file"
        md5: 'df8fede7ff71608e24a5576326e41c75'
      .should.be.resolvedWith status: false
      logs = await @fs.base.readFile
        target: "#{tmpdir}/localhost.log"
        encoding: 'utf8'
      (logs.includes 'Hashes match, skipping').should.be.true()

  they 'current cache file dont match provided hash', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/my_file"
        content: 'okay'
      @file
        target: "#{tmpdir}/my_cache_file"
        content: 'not okay'
      @file.cache
        source: "#{tmpdir}/my_file"
        cache_file: "#{tmpdir}/my_cache_file"
        md5: 'df8fede7ff71608e24a5576326e41c75'
      .should.be.resolvedWith status: true

  they 'target file must match the hash', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/my_file"
        content: 'okay'
      @file.cache
        source: "#{tmpdir}/my_file"
        cache_dir: "#{tmpdir}/cache"
        md5: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      .should.be.rejectedWith message: "Invalid Target Hash: target \"#{tmpdir}/cache/my_file\" got df8fede7ff71608e24a5576326e41c75 instead of xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

  they 'into local cache_dir', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.cache
        source: "#{__filename}"
        cache_dir: "#{tmpdir}/my_cache_dir"
      .should.be.resolvedWith status: true
      @file.cache
        source: "#{__filename}"
        cache_dir: "#{tmpdir}/my_cache_dir"
      .should.be.resolvedWith status: false
      @fs.assert
        target: "#{tmpdir}/my_cache_dir/#{path.basename __filename}"

  describe 'md5', ->

    they 'bypass cache if string match', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @log.fs
          basedir: tmpdir
          serializer: text: (log) -> "[#{log.level}] #{log.message}\n"
        @file
          target: "#{tmpdir}/source"
          content: "okay"
        @file
          target: "#{tmpdir}/target"
          content: "okay"
        # In file mode, md5 value will be calculated from source
        @file.cache
          source: "#{tmpdir}/source"
          cache_file: "#{tmpdir}/target"
          md5: true
        .should.be.resolvedWith status: false
        logs = await @fs.base.readFile
          target: "#{tmpdir}/localhost.log"
          encoding: 'utf8'
        (logs.includes '[DEBUG] Hashes match, skipping').should.be.true()
        @file.cache
          source: "#{tmpdir}/source"
          cache_file: "#{tmpdir}/target"
          md5: 'df8fede7ff71608e24a5576326e41c75'
        .should.be.resolvedWith status: false
        logs = await @fs.base.readFile
          target: "#{tmpdir}/localhost.log"
          encoding: 'utf8'
        (logs.includes '[DEBUG] Hashes match, skipping').should.be.true()
        @file.cache
          source: "#{tmpdir}/source"
          cache_file: "#{tmpdir}/target"
          md5: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        .should.be.rejectedWith message: "Invalid Target Hash: target \"#{tmpdir}/target\" got df8fede7ff71608e24a5576326e41c75 instead of xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
