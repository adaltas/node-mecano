
nikita = require '@nikitajs/core/lib'
{config, images, tags} = require '../test'
they = require('mocha-they')(config)

return unless tags.lxd_prlimit

describe 'lxd.goodie.prlimit', ->

  they 'stdout', ({ssh}) ->
    nikita
      $ssh: ssh
    , ->
      @lxd.delete
        container: 'c1'
        force: true
      @lxd.init
        image: "images:#{images.alpine}"
        container: 'c1'
      @lxd.start
        container: 'c1'
      try
        await @lxd.goodies.prlimit
          container: 'c1'
      catch err
        throw err unless err.code is 'NIKITA_LXC_PRLIMIT_MISSING'
