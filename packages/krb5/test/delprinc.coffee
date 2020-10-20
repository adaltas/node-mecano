
nikita = require '@nikitajs/engine/src'
{tags, ssh, krb5} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.krb5_delprinc

describe 'krb5.delprinc', ->

  they 'a principal which exists', ({ssh}) ->
    nikita
      ssh: ssh
      krb5: admin: krb5
    , ->
      await @krb5.addprinc
        principal: "nikita@#{krb5.realm}"
        randkey: true
      {status} = await @krb5.delprinc
        principal: "nikita@#{krb5.realm}"
      status.should.be.true()

  they 'a principal which does not exist', ({ssh}) ->
    nikita
      ssh: ssh
      krb5: admin: krb5
    , ->
      await @krb5.delprinc
        principal: "nikita@#{krb5.realm}"
      {status} = await @krb5.delprinc
        principal: "nikita@#{krb5.realm}"
      status.should.be.false()
