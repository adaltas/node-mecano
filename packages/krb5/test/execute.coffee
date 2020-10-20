
nikita = require '@nikitajs/engine/src'
{tags, ssh, krb5} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.krb5

describe 'krb5.execute', ->

  describe 'schema', ->

    it 'admin and cmd must be provided', ->
      nikita
      .krb5.execute {}
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'multiple errors where found in the configuration of action `krb5.execute`:'
          '#/required config should have required property \'admin\';'
          '#/required config should have required property \'cmd\'.'
        ].join ' '

  describe 'action', ->

    they 'global properties', ({ssh}) ->
      nikita
        ssh: ssh
        krb5: admin: krb5
      , ->
        {stdout} = await @krb5.execute
          cmd: 'listprincs'
        stdout.should.containEql 'kadmin/admin'

    they 'option cmd', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        {stdout} = await @krb5.execute
          admin: krb5
          cmd: 'listprincs'
        stdout.should.containEql 'kadmin/admin'

    they 'config grep with string', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        {status} = await @krb5.execute
          admin: krb5
          cmd: 'listprincs'
          grep: krb5.principal
        status.should.be.true()
        {status} = await @krb5.execute
          admin: krb5
          cmd: 'listprincs'
          grep: "missing string"
        status.should.be.false()

    they 'config grep with regexp', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        {status, stdout} = await @krb5.execute
          admin: krb5
          cmd: 'listprincs'
          grep: /^.*@.*$/
        status.should.be.true()
        {status, stdout} = await @krb5.execute
          admin: krb5
          cmd: 'listprincs'
          grep: /^.*missing.*$/
        status.should.be.false()
        
