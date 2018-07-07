# Be aware to specify the machine if docker mahcine is used
# docker.build like, docker.run , docker.rm is used by other docker.command inside
# test amd should not relie on them

nikita = require '../../src'
test = require '../test'
they = require 'ssh2-they'
docker = require '../../src/misc/docker'

describe 'docker.checksum', ->

  config = test.config()
  return if config.disable_docker
  scratch = test.scratch @

  they 'checksum on existing repository', (ssh) ->
    image_id = null
    nikita
      ssh: ssh
      docker: config.docker
    .docker.rmi
      image: 'nikita/checksum'
    .docker.build
      image: 'nikita/checksum'
      content: "FROM scratch\nCMD ['echo \"hello build from text #{Date.now()}\"']"
    , (err, {image}) ->
      image_id = image unless err
    .docker.checksum
      image: 'nikita/checksum'
      tag: 'latest'
    , (err, {checksum}) ->
      checksum.should.startWith "sha256:#{image_id}" unless err
    .docker.rmi
      image: 'nikita/checksum'
    .promise()

  they 'checksum on not existing repository', (ssh) ->
    nikita
      ssh: ssh
      docker: config.docker
    .docker.checksum
      image: 'nikita/invalid_checksum'
      tag: 'latest'
    , (err, {checksum}) ->
      (checksum is undefined).should.be.true() unless err
    .promise()
