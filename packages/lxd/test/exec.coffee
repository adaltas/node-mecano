
nikita = require '@nikitajs/core/lib'
{config, images, tags} = require './test'
they = require('mocha-they')(config)

return unless tags.lxd

describe 'lxd.exec', ->

  they 'a command with pipe inside', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      await @lxd.delete
        container: 'c1'
        force: true
      await @lxd.init
        image: "images:#{images.alpine}"
        container: 'c1'
      await @lxd.start
        container: 'c1'
      {status, stdout} = await @lxd.exec
        container: 'c1'
        command: """
        cat /etc/os-release | egrep ^ID=
        """
      stdout.trim().should.eql 'ID=alpine'
      status.should.be.true()

  describe 'option `shell`', ->
    
    they 'default to shell', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'c1'
          force: true
        await @lxd.init
          image: "images:#{images.alpine}"
          container: 'c1'
        await @lxd.start
          container: 'c1'
        {stdout} = await @lxd.exec
          container: 'c1'
          command: 'echo $0'
          trim: true
        stdout.should.eql 'sh'
          
    they 'set to bash', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'c1'
          force: true
        await @lxd.init
          image: "images:#{images.alpine}"
          container: 'c1'
        await @lxd.start
          container: 'c1'
        await @lxd.exec
          metadata: # Wait for network to be ready
            retry: 3
            sleep: 200
          container: 'c1'
          command: 'apk add bash'
        {stdout} = await @lxd.exec
          container: 'c1'
          command: 'echo $0'
          shell: 'bash'
          trim: true
        stdout.should.eql 'bash'

  describe 'option `trap`', ->

    they 'is enabled', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'c1'
          force: true
        await @lxd.init
          image: "images:#{images.alpine}"
          container: 'c1'
        await @lxd.start
          container: 'c1'
        @lxd.exec
          container: 'c1'
          trap: true
          command: """
          false
          true
          """
        .should.be.rejectedWith
          exit_code: 1

    they 'is disabled', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'c1'
          force: true
        await @lxd.init
          image: "images:#{images.alpine}"
          container: 'c1'
        await @lxd.start
          container: 'c1'
        {status, code} = await @lxd.exec
          container: 'c1'
          trap: false
          command: """
          false
          true
          """
        status.should.be.true()
        code.should.eql 0

  describe 'option `env`', ->

    they 'pass multiple variables', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'c1'
          force: true
        await @lxd.init
          image: "images:#{images.alpine}"
          container: 'c1'
        await @lxd.start
          container: 'c1'
        {stdout} = await @lxd.exec
          container: 'c1'
          env:
            'ENV_VAR_1': 'value 1'
            'ENV_VAR_2': 'value 1'
          command: 'env'
        stdout
        .split('\n')
        .filter (line) -> /^ENV_VAR_/.test line
        .should.eql [ 'ENV_VAR_1=value 1', 'ENV_VAR_2=value 1' ]

  describe 'option `user`', ->

    they 'non root user', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'c1'
          force: true
        await @lxd.init
          image: "images:#{images.alpine}"
          container: 'c1'
        await @lxd.start
          container: 'c1'
        @lxd.exec
          container: 'c1'
          command: 'adduser --uid 1234 --disabled-password nikita'
        {stdout} = await @lxd.exec
          container: 'c1'
          user: 1234
          command: 'whoami'
          trim: true
        stdout.should.eql 'nikita'
        
        
