
nikita = require '@nikitajs/engine/src'
{tags, ssh, docker} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.docker

describe 'docker.build', ->

  @timeout 60000

  describe 'errors', ->

    they 'fail with missing image parameter', ({ssh}) ->
      nikita
        ssh: ssh
        docker: docker
      .docker.build
        false_source: 'Dockerfile'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `docker.build`:'
          '#/required config should have required property \'image\'.'
        ].join ' '

    they 'fail with exclusive parameters', ({ssh}) ->
      nikita
        ssh: ssh
        docker: docker
      .docker.build
        image: 'nikita/should_not_exists_1'
        file: "#{__dirname}/Dockerfile"
        content: "FROM scratch \ CMD ['echo \"hello world\"']"
      .should.be.rejectedWith
        code: 'NIKITA_DOCKER_BUILD_CONTENT_FILE_REQUIRED'
        message: 'NIKITA_DOCKER_BUILD_CONTENT_FILE_REQUIRED: could not build the container, one of the `content` or `file` config property must be provided'


  describe 'usage', ->
    
    they 'from text', ({ssh}) ->
      nikita
        ssh: ssh
        docker: docker
      , ->
        @docker.rmi 'nikita/should_exists_1'
        {status, stdout} = await @docker.build
          image: 'nikita/should_exists_1'
          content: """
          FROM scratch
          CMD echo hello 1
          """
        status.should.be.true()
        stdout.should.containEql 'Step 2/2 : CMD echo hello'
        @docker.rmi 'nikita/should_exists_1'

    they 'from cwd',  ({ssh}) ->
      nikita
        ssh: ssh
        docker: docker
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @docker.rmi 'nikita/should_exists_2'
        @file
          target: "#{tmpdir}/Dockerfile"
          content: """
          FROM scratch
          CMD echo hello 2
          """
        {status} = await @docker.build
          image: 'nikita/should_exists_2'
          cwd: tmpdir
        status.should.be.true()
        @docker.rmi 'nikita/should_exists_2'

    they 'from Dockerfile (exist)', ({ssh}) ->
      nikita
        ssh: ssh
        docker: docker
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @docker.rmi 'nikita/should_exists_3'
        @file
          content: """
          FROM scratch
          CMD ['echo "hello build from Dockerfile #{Date.now()}"']
          """
          target: "#{tmpdir}/nikita_Dockerfile"
        {status} = await @docker.build
          image: 'nikita/should_exists_3'
          file: "#{tmpdir}/nikita_Dockerfile"
        status.should.be.true()
        @docker.rmi 'nikita/should_exists_3'

    they 'from Dockerfile (not exist)', ({ssh}) ->
      nikita
        ssh: ssh
        docker: docker
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        await @docker.build
          image: 'nikita/should_not_exists_4'
          file: "#{tmpdir}/file/does/not/exist"
        .should.be.rejectedWith
          code: 'NIKITA_FS_CRS_TARGET_ENOENT'

    they 'status not modified', ({ssh}) ->
      status_true = []
      status_false = []
      nikita
        ssh: ssh
        docker: docker
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @docker.rmi 'nikita/should_exists_5'
        @file
          target: "#{tmpdir}/nikita_Dockerfile"
          content: """
          FROM scratch
          CMD echo hello 5
          """
        {status, stdout} = await @docker.build
          image: 'nikita/should_exists_5'
          file: "#{tmpdir}/nikita_Dockerfile"
          log: ({log}) -> status_true.push log
        status.should.be.true()
        {status} = await @docker.build
          image: 'nikita/should_exists_5'
          file: "#{tmpdir}/nikita_Dockerfile"
          log: ({log}) -> status_false.push log
        status.should.be.false()
        @docker.rmi 'nikita/should_exists_5'
        @call ->
          status_true.filter( (s) -> /^New image id/.test s?.message ).length.should.eql 1
          status_false.filter( (s) -> /^Identical image id/.test s?.message ).length.should.eql 1
