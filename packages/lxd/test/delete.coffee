
nikita = require '@nikitajs/core/lib'
{config, images, tags} = require './test'
they = require('mocha-they')(config)

return unless tags.lxd

describe 'lxd.delete', ->

  they 'Delete a container', ({ssh}) ->
    nikita
      $ssh: ssh
    , ->
      await @lxd.init
        image: "images:#{images.alpine}"
        container: 'nikita-delete-1'
      await @lxd.stop
        container: 'nikita-delete-1'
      {$status} = await @lxd.delete
        container: 'nikita-delete-1'
      $status.should.be.true()
      {$status} = await @lxd.delete
        container: 'nikita-delete-1'
      $status.should.be.false()
  
  they 'Force deletion of a running container', ({ssh}) ->
    nikita
      $ssh: ssh
    , ->
      await @lxd.init
        image: "images:#{images.alpine}"
        container: 'nikita-delete-2'
      await @lxd.start
        container: 'nikita-delete-2'
      {$status} = await @lxd.delete
        container: 'nikita-delete-2'
        force: true
      $status.should.be.true()

  they 'Not found', ({ssh}) ->
    nikita
      $ssh: ssh
    , ->
      await @lxd.delete  # repeated to be sure the container is absent
        container: 'nikita-delete-3'
      {$status} = await @lxd.delete
        container: 'nikita-delete-3'
      $status.should.be.false()
