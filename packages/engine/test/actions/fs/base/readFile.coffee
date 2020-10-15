
fs = require 'ssh2-fs'
nikita = require '../../../../src'
{tags, ssh} = require '../../../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'actions.fs.readFile', ->

  they 'config `encoding`', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.base.writeFile
        target: "{{parent.metadata.tmpdir}}/a_file"
        content: 'hello'
      @fs.base.readFile
        target: "{{parent.metadata.tmpdir}}/a_file"
        encoding: 'ascii'
      .should.be.resolvedWith data: 'hello'

  they 'argument `target`', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.base.writeFile
        target: "{{parent.metadata.tmpdir}}/a_file"
        content: 'hello'
      @fs.base.readFile "{{parent.metadata.tmpdir}}/a_file"
      .should.be.resolvedWith data: Buffer.from 'hello'
  
  describe 'error', ->
  
    they 'forward errors from createReadStream', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.base.readFile "#{tmpdir}/whereareu"
        .should.be.rejectedWith
          message: "NIKITA_FS_CRS_TARGET_ENOENT: fail to read a file because it does not exist, location is \"#{tmpdir}/whereareu\"."
          errno: -2
          code: 'NIKITA_FS_CRS_TARGET_ENOENT'
          syscall: 'open'
          path: "#{tmpdir}/whereareu"
