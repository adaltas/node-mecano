
require('@nikitajs/core/lib/registry')
.register
  lxd:
    config:
      device:
        '': '@nikitajs/lxd/src/config/device'
        delete: '@nikitajs/lxd/src/config/device/delete'
        exists: '@nikitajs/lxd/src/config/device/exists'
      set: '@nikitajs/lxd/src/config/set'
    init: '@nikitajs/lxd/src/init'
    delete: '@nikitajs/lxd/src/delete'
    start: '@nikitajs/lxd/src/start'
    stop: '@nikitajs/lxd/src/stop'
    exec: '@nikitajs/lxd/src/exec'
    file:
      push: '@nikitajs/lxd/src/file/push'
      exists: '@nikitajs/lxd/src/file/exists'
    goodies:
      prlimit: '@nikitajs/lxd/src/goodies/prlimit'
    network:
      '': '@nikitajs/lxd/src/network'
      create: '@nikitajs/lxd/src/network'
      attach: '@nikitajs/lxd/src/network/attach'
      detach: '@nikitajs/lxd/src/network/detach'
      delete: '@nikitajs/lxd/src/network/delete'
    running: '@nikitajs/lxd/src/running'
