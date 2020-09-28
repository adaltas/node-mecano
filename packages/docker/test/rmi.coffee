
nikita = require '@nikitajs/engine/src'
{tags, ssh, docker} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.docker

describe 'docker.rmi', ->

  they 'remove image', ({ssh}) ->
    nikita
      ssh: ssh
      docker: docker
    , ->
      @docker.build
        image: 'nikita/rmi_test'
        content: "FROM scratch\nCMD ['echo \"hello build from text\"']"
      {status} = await @docker.rmi
        image: 'nikita/rmi_test'
      status.should.be.true()

  they 'status unmodifed', ({ssh}) ->
    nikita
      ssh: ssh
      docker: docker
    , ->
      @docker.build
        image: 'nikita/rmi_test:latest'
        content: "FROM scratch\nCMD ['echo \"hello build from text\"']"
      @docker.rmi
        image: 'nikita/rmi_test'
      {status} = await @docker.rmi
        image: 'nikita/rmi_test'
      status.should.be.false()
