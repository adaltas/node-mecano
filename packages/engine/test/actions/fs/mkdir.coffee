
nikita = require '../../../src'
utils = require '../../../src/utils'
{tags, ssh} = require '../../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'actions.fs.mkdir', ->

  they 'a new directory', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.mkdir
        target: "{{parent.metadata.tmpdir}}/a_directory"
      @fs.stat
        target: "{{parent.metadata.tmpdir}}/a_directory"
      .then ({stats}) ->
        utils.stats.isDirectory(stats.mode).should.be.true()

  they 'over an existing directory', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.mkdir
        target: "{{parent.metadata.tmpdir}}/a_directory"
      @fs.mkdir
        target: "{{parent.metadata.tmpdir}}/a_directory"
      .should.be.rejectedWith
        message: /NIKITA_FS_MKDIR_TARGET_EEXIST: fail to create a directory, one already exists, location is ".+\/a_directory"/
        code: 'NIKITA_FS_MKDIR_TARGET_EEXIST',
        error_code: 'EEXIST',
        errno: -17,
        path: /.*\/a_directory/
        syscall: 'mkdir'
