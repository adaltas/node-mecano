
nikita = require '@nikitajs/engine/src'
{tags, ssh, docker} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.docker or tags.docker_volume

describe 'docker.volume_rm', ->

  they 'a named volume', ({ssh}) ->
    nikita
      ssh: ssh
      docker: docker
    , ->
      @docker.volume_rm
        name: 'my_volume'
      @docker.volume_create
        name: 'my_volume'
      {status} = await @docker.volume_rm
        name: 'my_volume'
      status.should.be.true()
      {status} = await @docker.volume_rm
        name: 'my_volume'
      status.should.be.false()
