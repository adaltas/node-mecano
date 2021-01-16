
nikita = require '@nikitajs/engine/lib'
{tags, config} = require './test'
they = require('mocha-they')(config)

return unless tags.lxd

describe 'lxd.state', ->
      
  they 'Show instance state', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      await @lxd.delete
        container: 'u1'
        force: true
      await @lxd.init
        image: 'images:alpine/edge'
        container: 'u1'
      {status, config} = await @lxd.state
        container: 'u1'
      status.should.be.true()
      config.status.should.eql 'Stopped'

  they 'Instance not found', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      await @lxd.delete
        container: 'u1'
        force: true
      @lxd.state
        container: 'u1'
      .should.be.rejectedWith
        exit_code: 1
