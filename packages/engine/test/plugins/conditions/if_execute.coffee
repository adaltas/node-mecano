
nikita = require '../../../src'
{tags, ssh} = require '../../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'plugin.condition if_execute', ->

  they 'pass if string command is successfull', ({ssh}) ->
    {status} = await nikita
      if_execute: 'exit 0'
      handler: -> true
      ssh: ssh
    status.should.be.true()

  they 'skip if string command exit with code_skipped', ({ssh}) ->
    {status} = await nikita
      if_execute: 'exit 42'
      handler: -> true
      ssh: ssh
    status.should.be.false()

  they 'error if code_skipped not match', ({ssh}) ->
    nikita
      if_execute:
        code_skipped: 1
        cmd: 'exit 42'
      handler: -> true
      ssh: ssh
    .should.be.rejectedWith
      message: [
        'NIKITA_EXECUTE_EXIT_CODE_INVALID:'
        'an unexpected exit code was encountered,'
        'command is "exit 42", got 42 instead of 0.'
      ].join ' '
  
  they 'skip if skip_code match', ({ssh}) ->
    {status} = await nikita
      if_execute:
        code_skipped: 42
        cmd: 'exit 42'
      handler: -> true
      ssh: ssh
    status.should.be.false()
