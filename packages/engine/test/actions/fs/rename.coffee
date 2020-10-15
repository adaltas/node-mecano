
nikita = require '../../../src'
utils = require '../../../src/utils'
{tags, ssh} = require '../../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'actions.fs.rename', ->

  they 'create', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ->
      @fs.writeFile
        target: "{{parent.metadata.tmpdir}}/a_source"
        content: 'hello'
      @fs.rename
        source: "{{parent.metadata.tmpdir}}/a_source"
        target: "{{parent.metadata.tmpdir}}/a_target"
      {stats} = await @fs.stat
        target: "{{parent.metadata.tmpdir}}/a_target"
      utils.stats.isFile(stats.mode).should.be.true()
