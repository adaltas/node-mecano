
nikita = require '@nikitajs/core'
{tags, ssh} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.lxd

describe 'lxd.delete', ->

  they 'Delete a container', ({ssh}) ->
    nikita
      ssh: ssh
    .lxd.init
      image: 'ubuntu:'
      container: 'c1'
    .lxd.stop
      container: 'c1'
    .lxd.delete
      container: 'c1'
    , (err, {status}) ->
      status.should.be.true() unless err
    .lxd.delete
      container: 'c1'
    , (err, {status}) ->
      status.should.be.false() unless err
    .promise()


  they 'Force deletion of a running container', ({ssh}) ->
    nikita
      ssh: ssh
    .lxd.init
      image: 'ubuntu:'
      container: 'container1'
    .lxd.start
      container: 'container1'
    .lxd.delete
      container: 'container1'
      force: true
    , (err, {status}) ->
      status.should.be.true()
    .promise()

  they 'Not found', ({ssh}) ->
    nikita
      ssh: ssh
    .lxd.delete  # repeated to be sure the container is absent
      container: 'container1'
    .lxd.delete
      container: 'container1'
    , (err, {status}) ->
      status.should.be.false()
    .promise()
