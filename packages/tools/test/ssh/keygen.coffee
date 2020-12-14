
nikita = require '@nikitajs/engine/src'
{tags, ssh} = require '../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'tools.ssh.keygen', ->

  they 'a new key', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      {status} = await @tools.ssh.keygen
        target: "#{tmpdir}/folder/id_rsa"
        bits: 2048
        comment: 'nikita'
      status.should.be.true()
      {status} = await @tools.ssh.keygen
        target: "#{tmpdir}/folder/id_rsa"
        bits: 2048
        comment: 'nikita'
      status.should.be.false()

    
