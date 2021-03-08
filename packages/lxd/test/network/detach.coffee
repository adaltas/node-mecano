
nikita = require '@nikitajs/core/lib'
{config, images, tags} = require '../test'
they = require('mocha-they')(config)

return unless tags.lxd

describe 'lxd.network.detach', ->

  they 'Detach a network from a container', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      await registry.register 'clean', ->
        @lxd.delete
          container: 'u0'
          force: true
        @lxd.network.delete
          network: "testnet0"
      try
        @clean()
        @lxd.init
          image: "images:#{images.alpine}"
          container: 'u0'
        @lxd.network
          network: "testnet0"
        @lxd.network.attach
          network: "testnet0"
          container: "u0"
        {$status} = await @lxd.network.detach
          network: "testnet0"
          container: "u0"
        $status.should.be.true()
      finally
        @clean()

  they 'Network already detached', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      await registry.register 'clean', ->
        @lxd.delete
          container: 'u0'
          force: true
        @lxd.network.delete
          network: "testnet0"
      try
        @clean()
        @lxd.init
          image: "images:#{images.alpine}"
          container: 'u0'
        @lxd.network
          network: "testnet0"
        {$status} = await @lxd.network.detach
          network: "testnet0"
          container: "u0"
        $status.should.be.false()
      finally
        @clean()
