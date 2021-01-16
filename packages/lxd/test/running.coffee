
nikita = require '@nikitajs/engine/lib'
{tags, config} = require './test'
they = require('mocha-they')(config)

return unless tags.lxd

describe 'lxd.running', ->

  they 'Running container', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      await @lxd.delete
        container: 'u1'
        force: true
      await @lxd.init
        image: 'images:alpine/edge'
        container: 'u1'
      await @lxd.start
        container: 'u1'
      {status} = await @lxd.running
        container: 'u1'
      status.should.be.true()

  they 'Stopped container', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      await @lxd.delete
        container: 'u1'
        force: true
      await @lxd.init
        image: 'images:alpine/edge'
        container: 'u1'
      {status} = await @lxd.running
        container: 'u1'
      status.should.be.false()
