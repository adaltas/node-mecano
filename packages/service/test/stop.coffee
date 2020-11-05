
nikita = require '@nikitajs/engine/src'
{tags, ssh, service} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.service_systemctl

describe 'service.stop', ->
  
  @timeout 20000

  they 'should stop', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      @service.install service.name
      @service.start service.srv_name
      {status} = await @service.stop service.srv_name
      status.should.be.true()
      {status} = await @service.stop service.srv_name
      status.should.be.false()

  they 'no error when invalid service name', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      {status} = await @service.stop
        name: 'thisdoenstexit'
        relax: true
      status.should.be.false()
