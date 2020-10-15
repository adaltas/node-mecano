
nikita = require '../../../../src'
utils = require '../../../../src/utils'
{tags, ssh} = require '../../../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'actions.fs.lstat', ->

  they 'with a file link', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.base.writeFile
        target: "{{parent.metadata.tmpdir}}/a_file"
        content: 'hello'
      @fs.base.symlink
        target: "{{parent.metadata.tmpdir}}/a_link"
        source: "{{parent.metadata.tmpdir}}/a_file"
      @fs.base.lstat
        target: "{{parent.metadata.tmpdir}}/a_link"
      .then ({stats}) ->
        utils.stats.isFile(stats.mode).should.be.false()
        utils.stats.isSymbolicLink(stats.mode).should.be.true()

  they 'with a directory link', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.base.mkdir
        target: "{{parent.metadata.tmpdir}}/a_dir"
      @fs.base.symlink
        target: "{{parent.metadata.tmpdir}}/a_link"
        source: "{{parent.metadata.tmpdir}}/a_dir"
      @fs.base.lstat
        target: "{{parent.metadata.tmpdir}}/a_link"
      .then ({stats}) ->
        utils.stats.isDirectory(stats.mode).should.be.false()
        utils.stats.isSymbolicLink(stats.mode).should.be.true()

  they 'option argument default to target', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.base.writeFile
        target: "{{parent.metadata.tmpdir}}/a_source"
        content: ''
      @fs.base.symlink
        target: "{{parent.metadata.tmpdir}}/a_target"
        source: "{{parent.metadata.tmpdir}}/a_source"
      @fs.base.lstat
        target: "{{parent.metadata.tmpdir}}/a_target"
      .then ({stats}) ->
        utils.stats.isSymbolicLink(stats.mode).should.be.true()
