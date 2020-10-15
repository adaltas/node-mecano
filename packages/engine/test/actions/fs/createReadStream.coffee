
nikita = require '../../../src'
{tags, ssh, scratch} = require '../../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'actions.fs.createReadStream', ->

  they 'option on_readable', ({ssh}) ->
    buffers = []
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.writeFile
        target: "{{parent.metadata.tmpdir}}/a_file"
        content: 'hello'
      await @fs.createReadStream
        target: "{{parent.metadata.tmpdir}}/a_file"
        on_readable: (rs) ->
          while buffer = rs.read()
            buffers.push buffer
      Buffer.concat(buffers).toString().should.eql 'hello'

  they 'option stream', ({ssh}) ->
    buffers = []
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.writeFile
        target: "{{parent.metadata.tmpdir}}/a_file"
        content: 'hello'
      @fs.createReadStream
        target: "{{parent.metadata.tmpdir}}/a_file"
        stream: (rs) ->
          rs.on 'readable', ->
            while buffer = rs.read()
              buffers.push buffer
      .then ->
        Buffer.concat(buffers).toString().should.eql 'hello'
      
  describe 'errors', ->

    they 'schema', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        @fs.createReadStream
          stream: (->)
        .should.be.rejectedWith
          message: 'NIKITA_SCHEMA_VALIDATION_CONFIG: one error was found in the configuration: #/required config should have required property \'target\'.'
    
    they 'NIKITA_FS_CRS_TARGET_ENOENT if file does not exist', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.createReadStream
          target: "#{tmpdir}/a_file"
          stream: (rs) ->
            rs.on 'readable', ->
              while buffer = rs.read()
                buffers.push buffer
        .should.be.rejectedWith
          message: "NIKITA_FS_CRS_TARGET_ENOENT: fail to read a file because it does not exist, location is \"#{tmpdir}/a_file\"."
          errno: -2
          code: 'NIKITA_FS_CRS_TARGET_ENOENT'
          syscall: 'open'
          path: "#{tmpdir}/a_file"
  
    they 'NIKITA_FS_CRS_TARGET_EISDIR if file is a directory', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.createReadStream
          target: "#{tmpdir}"
          on_readable: (rs) ->
            while buffer = rs.read()
              buffers.push buffer
        .should.be.rejectedWith
          message: "NIKITA_FS_CRS_TARGET_EISDIR: fail to read a file because it is a directory, location is \"#{tmpdir}\"."
          errno: -21
          code: 'NIKITA_FS_CRS_TARGET_EISDIR'
          syscall: 'read'
          path: "#{tmpdir}"
      
    
  
