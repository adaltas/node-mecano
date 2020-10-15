
nikita = require '../../../src'
{tags, ssh} = require '../../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'fs.link', ->

  they 'should link file', ({ssh}) ->
    # Create a non existing link
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.link # Link does not exist
        source: __filename
        target: "#{tmpdir}/link_test"
      .should.be.resolvedWith status: true
      @fs.link # Link already exists
        source: __filename
        target: "#{tmpdir}/link_test"
      .should.be.resolvedWith status: false
      @fs.assert
        target: "#{tmpdir}/link_test"
        filetype: 'symlink'

  they 'should link file with exec', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.link
        source: __filename
        target: "#{tmpdir}/test"
        exec: true
      .should.be.resolvedWith status: true
      @fs.link
        source: __filename
        target: "#{tmpdir}/test"
        exec: true
      .should.be.resolvedWith status: false
  
  they 'should link dir', ({ssh}) ->
    # Create a non existing link
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.link # Link does not exist
        source: __dirname
        target: "#{tmpdir}/link_test"
      .should.be.resolvedWith status: true
      @fs.link # Link already exists
        ssh: ssh
        source: __dirname
        target: "#{tmpdir}/link_test"
      .should.be.resolvedWith status: false
      @fs.assert
        target: "#{tmpdir}/link_test"
        filetype: 'symlink'
  
  they 'should create parent directories', ({ssh}) ->
    # Create a non existing link
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.link
        source: __dirname
        target: "#{tmpdir}/test/dir/link_test"
      .should.be.resolvedWith status: true
      @fs.assert
        target: "#{tmpdir}/test/dir/link_test"
        type: 'symlink'
      @fs.link
        ssh: ssh
        source: "#{__dirname}/merge.coffee"
        target: "#{tmpdir}/test/dir2/merge.coffee"
      .should.be.resolvedWith status: true
      @fs.link
        ssh: ssh
        source: "#{__dirname}/mkdir.coffee"
        target: "#{tmpdir}/test/dir2/mkdir.coffee"
      .should.be.resolvedWith status: true

  they 'should override invalid link', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.base.writeFile
        target: "#{tmpdir}/invalid_file"
        content: 'error'
      @fs.base.writeFile
        target: "#{tmpdir}/valid_file"
        content: 'ok'
      @fs.link
        source: "#{tmpdir}/invalid_file"
        target: "#{tmpdir}/file_link"
      .should.be.resolvedWith status: true
      # @fs.remove
      #   target: "#{tmpdir}/test/invalid_file"
      @fs.link
        source: "#{tmpdir}/test/valid_file"
        target: "#{tmpdir}/test/file_link"
      .should.be.resolvedWith status: true

  describe 'error', ->

    they 'for invalid arguments', ({ssh}) ->
      # Test missing source
      nikita
        ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.link
        target: __filename
      .should.be.rejectedWith message: 'Missing source, got undefined'
      @fs.link # Test missing target
        source: __filename
      .should.be.rejectedWith message: 'Missing source, got undefined'
