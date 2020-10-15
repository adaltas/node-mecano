
http = require 'http'
nikita = require '@nikitajs/engine/src'
{tags, ssh, tmpdir} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'file.download url', ->
  
  server = null

  beforeEach (next) ->
    server = http.createServer (req, res) ->
      res.writeHead 200, {'Content-Type': 'text/plain'}
      res.end 'okay'
    server.listen 12345, next

  afterEach (next) ->
    server.close()
    server.on 'close', next

  they 'download without cache and md5', ({ssh}) ->
    @timeout 100000
    # Download a non existing file
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.download
        source: 'http://localhost:12345'
        target: "#{tmpdir}/download"
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/download"
        content: /okay/
      @file.download # Download on an existing file
        source: 'http://localhost:12345'
        target: "#{tmpdir}/download"
      .should.be.resolvedWith status: false

  they 'should chmod', ({ssh}) ->
    @timeout 10000
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file.download
        source: 'http://localhost:12345'
        target: "#{tmpdir}/download_test"
        mode: 0o0770
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/download_test"
        mode: 0o0770

  describe 'cache', ->

    they 'cache file', ({ssh}) ->
      @timeout 100000
      # Download a non existing file
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.download
          source: 'http://localhost:12345'
          target: "#{tmpdir}/target"
          cache: true
          cache_file: "#{tmpdir}/cache_file"
        .should.be.resolvedWith status: true
        @fs.assert
          target: "#{tmpdir}/cache_file"
          content: /okay/
        @fs.assert
          target: "#{tmpdir}/target"
          content: /okay/

    they 'cache file defined globally', ({ssh}) ->
      @timeout 100000
      # Download a non existing file
      nikita
        tmpdir: true
        cache_file: "#{tmpdir}/cache_file"
      , ({metadata: {tmpdir}}) ->
        @file.download
          ssh: ssh
          source: 'http://localhost:12345'
          target: "#{tmpdir}/download"
        .should.be.resolvedWith status: true
        @fs.assert
          ssh: null
          target: "#{tmpdir}/download"
          content: 'okay'

    they 'cache dir', ({ssh}) ->
      @timeout 100000
      # Download a non existing file
      nikita
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.download
          ssh: ssh
          source: 'http://localhost:12345'
          target: "#{tmpdir}/download"
          cache: true
          cache_dir: "#{tmpdir}/cache_dir"
        .should.be.resolvedWith status: true
        @fs.assert
          ssh: null
          target: "#{tmpdir}/cache_dir/localhost:12345"

  describe 'md5', ->

    they 'use shortcircuit if target match md5', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @log.fs
          basedir: tmpdir
          serializer: text: (log) -> "[#{log.level}] #{log.message}\n"
        @file
          content: 'okay'
          target: "#{tmpdir}/target"
        @file.download
          source: 'http://localhost:12345'
          target: "#{tmpdir}/target"
          md5: 'df8fede7ff71608e24a5576326e41c75'
        .should.be.resolvedWith status: false
        logs = await @fs.base.readFile
          target: "#{tmpdir}/localhost.log"
          encoding: 'utf8'
        (logs.includes "[INFO] Destination with valid signature, download aborted").should.be.true()

    they 'bypass shortcircuit if target dont match md5', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file
          content: "not okay"
          target: "#{tmpdir}/target"
        @file.download
          source: 'http://localhost:12345'
          target: "#{tmpdir}/target"
          md5: 'df8fede7ff71608e24a5576326e41c75'
        .should.be.resolvedWith status: true
        @fs.assert
          target: "#{tmpdir}/target"
          content: /okay/

    they 'check signature on downloaded file', ({ssh}) ->
      # Download with invalid checksum
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.download
          source: 'http://localhost:12345'
          target: "#{tmpdir}/target"
          md5: '2f74dbbee4142b7366c93b115f914fff'
        .should.be.rejectedWith message: "Invalid downloaded checksum, found 'df8fede7ff71608e24a5576326e41c75' instead of '2f74dbbee4142b7366c93b115f914fff'"

    they 'count 1 if new file has correct checksum', ({ssh}) ->
      # Download with invalid checksum
      nikita
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.download
          ssh: ssh
          source: 'http://localhost:12345'
          target: "#{tmpdir}/check_md5"
          md5: 'df8fede7ff71608e24a5576326e41c75'
        .should.be.resolvedWith status: true

    they 'count 0 if a file exist with same checksum', ({ssh}) ->
      # Download with invalid checksum
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.download
          source: 'http://localhost:12345'
          target: "#{tmpdir}/check_md5"
        .should.be.resolvedWith status: true
        @file.download
          source: 'http://localhost:12345'
          target: "#{tmpdir}/check_md5"
          md5: 'df8fede7ff71608e24a5576326e41c75'
        .should.be.resolvedWith status: false
      
  describe 'error', ->

    they 'path must be absolute over ssh', ({ssh}) ->
      return unless ssh
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @file.download
          source: "http://localhost/sth"
          target: "a_dir/download_test"
        .should.be.rejectedWith message: 'Non Absolute Path: target is "a_dir/download_test", SSH requires absolute paths, you must provide an absolute path in the target or the cwd option'
