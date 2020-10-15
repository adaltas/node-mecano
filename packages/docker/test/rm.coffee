
nikita = require '@nikitajs/engine/src'
{tags, ssh, docker} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.docker

describe 'docker.rm', ->

  they 'remove stopped container', ({ssh}) ->
    @timeout 30000
    nikita
      ssh: ssh
      docker: docker
    , ->
      @docker.rm
        force: true
        container: 'nikita_rm'
      @docker.run
        cmd: "/bin/echo 'test'"
        image: 'alpine'
        name: 'nikita_rm'
        rm: false
      {status} = await @docker.rm
        container: 'nikita_rm'
      status.should.be.true()

  they 'remove live container (no force)', ({ssh}) ->
    @timeout 30000
    nikita
      ssh: ssh
      docker: docker
    , ->
      @docker.rm
        container: 'nikita_rm'
        force: true
      @docker.tools.service
        image: 'httpd'
        port: '499:80'
        name: 'nikita_rm'
      @docker.rm
        container: 'nikita_rm'
      .should.be.rejectedWith
        message: 'Container must be stopped to be removed without force'
      @docker.stop
        container: 'nikita_rm'
      @docker.rm
        container: 'nikita_rm'

  they 'remove live container (with force)', ({ssh}) ->
    @timeout 30000
    nikita
      ssh: ssh
      docker: docker
    , ->
      @docker.rm
        container: 'nikita_rm'
        force: true
      @docker.tools.service
        image: 'httpd'
        port: '499:80'
        name: 'nikita_rm'
      {status} = await @docker.rm
        container: 'nikita_rm'
        force: true
      status.should.be.true()
