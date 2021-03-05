
nikita = require '@nikitajs/core/lib'
{config, images, tags} = require './test'
they = require('mocha-they')(config)

return unless tags.lxd

describe 'lxd.state', ->
      
  they 'Show instance state', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      registry.register 'clean', ->
        @lxd.delete 'nikita-state-1', force: true
      await @clean()
      await @lxd.init
        image: "images:#{images.alpine}"
        container: 'nikita-state-1'
      {$status, config} = await @lxd.state
        container: 'nikita-state-1'
      $status.should.be.true()
      config.status.should.eql 'Stopped'
      await @clean()

  they 'Instance not found', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      registry.register 'clean', ->
        @lxd.delete 'nikita-state-2', force: true
      await @clean()
      @lxd.state
        container: 'nikita-state-2'
      .should.be.rejectedWith
        exit_code: 1
      await @clean()
