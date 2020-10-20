
nikita = require '@nikitajs/engine/src'
{tags, ssh, krb5} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.krb5_addprinc

describe 'krb5.addprinc', ->

  describe 'schema', ->
    
    it 'admin and principal must be provided', ->
      nikita
      .krb5.addprinc
        randkey: true
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'multiple errors where found in the configuration of action `krb5.addprinc`:'
          '#/required config should have required property \'admin\';'
          '#/required config should have required property \'principal\'.'
        ].join ' '

    it 'one of password or randkey must be provided', ->
      nikita
      .krb5.addprinc
        admin: krb5
        principal: "nikita@#{krb5.realm}"
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'multiple errors where found in the configuration of action `krb5.addprinc`:'
          '#/oneOf config should match exactly one schema in oneOf, passingSchemas is null;'
          '#/oneOf/0/required config should have required property \'password\';'
          '#/oneOf/1/required config should have required property \'randkey\'.'
        ].join ' '

  describe 'action', ->

    they 'create a new principal with a randkey', ({ssh}) ->
      nikita
        ssh: ssh
        krb5: admin: krb5
      , ->
        await @krb5.delprinc
          principal: "nikita@#{krb5.realm}"
        {status} = await @krb5.addprinc
          principal: "nikita@#{krb5.realm}"
          randkey: true
        status.should.be.true()
        {status} = await @krb5.addprinc
          principal: "nikita@#{krb5.realm}"
          randkey: true
        status.should.be.false()

    they 'create a new principal with a password', ({ssh}) ->
      nikita
        ssh: ssh
        krb5: admin: krb5
      , ->
        await @krb5.delprinc
          principal: "nikita@#{krb5.realm}"
        {status} = await @krb5.addprinc
          principal: "nikita@#{krb5.realm}"
          password: 'password1'
        status.should.be.true()
        {status} = await @krb5.addprinc
          principal: "nikita@#{krb5.realm}"
          password: 'password2'
          password_sync: true
        status.should.be.true()
        {status} = await @krb5.addprinc
          principal: "nikita@#{krb5.realm}"
          password: 'password2'
          password_sync: true
        status.should.be.false()

    they 'dont overwrite password', ({ssh}) ->
      nikita
        ssh: ssh
        krb5: admin: krb5
      , ->
        await @krb5.delprinc
          principal: "nikita@#{krb5.realm}"
        {status} = await @krb5.addprinc
          principal: "nikita@#{krb5.realm}"
          password: 'password1'
        status.should.be.true()
        {status} = await @krb5.addprinc
          principal: "nikita@#{krb5.realm}"
          password: 'password2'
          password_sync: false # Default
        status.should.be.false()
        await @execute
          cmd: "echo password1 | kinit nikita@#{krb5.realm}"

    they 'call function with new style', ({ssh}) ->
      user =
        password: 'user123'
        password_sync: true
        principal: 'user2@NODE.DC1.CONSUL'
      nikita
        ssh: ssh
        krb5: admin: krb5
      , ->
        await @execute
          cmd: 'rm -f /etc/security/keytabs/user1.service.keytab || true ; exit 0;'
        await @krb5.delprinc
          principal: user.principal
        await @krb5.delprinc
          principal: "user1/krb5@NODE.DC1.CONSUL"
        await @krb5.addprinc
          principal: "user1/krb5@NODE.DC1.CONSUL"
          randkey: true
          keytab: '/etc/security/keytabs/user1.service.keytab'
        {status} = await @krb5.addprinc user
        status.should.be.true()
        {status} = await @execute
          cmd: "echo #{user.password} | kinit #{user.principal}"
        status.should.be.true()
