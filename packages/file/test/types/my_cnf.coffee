
nikita = require '@nikitajs/engine/src'
{tags, ssh} = require '../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'file.types.my_cnf', ->

  they 'generate from content', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      {status} = await @file.types.my_cnf
        target: "#{tmpdir}/my.cnf"
        content:
          'client':
            'socket': '/var/lib/mysql/mysql.sock'
      status.should.be.true()
      @fs.assert
        target: "#{tmpdir}/my.cnf"
        content: """
        [client]
        socket = /var/lib/mysql/mysql.sock
        """
        trim: true
