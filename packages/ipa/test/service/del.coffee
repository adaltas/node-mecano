
nikita = require '@nikitajs/engine/src'
{tags, ssh, ipa} = require '../test'
they = require('ssh2-they').configure ssh

return unless tags.ipa

describe 'ipa.service.del', ->
  
  they 'delete a missing service', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      @ipa.service.del connection: ipa,
        principal: 'test_service_del'
      {status} = await @ipa.service.del connection: ipa,
        principal: 'test_service_del'
      status.should.be.false()

  they 'delete a service', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      @ipa.service connection: ipa,
        principal: 'test_service_del/freeipa.nikita.local'
      {status} = await @ipa.service.del connection: ipa,
        principal: 'test_service_del/freeipa.nikita.local'
      status.should.be.true()
