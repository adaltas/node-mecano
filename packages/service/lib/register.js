// Generated by CoffeeScript 2.5.1
// registration of `nikita.service` actions
var registry;

require('@nikitajs/file/lib/register');

registry = require('@nikitajs/engine/lib/registry');

module.exports = {
  service: {
    '': '@nikitajs/service/lib',
    assert: '@nikitajs/service/lib/assert',
    discover: '@nikitajs/service/lib/discover',
    install: '@nikitajs/service/lib/install',
    init: '@nikitajs/service/lib/init',
    remove: '@nikitajs/service/lib/remove',
    restart: '@nikitajs/service/lib/restart',
    start: '@nikitajs/service/lib/start',
    startup: '@nikitajs/service/lib/startup',
    status: '@nikitajs/service/lib/status',
    stop: '@nikitajs/service/lib/stop'
  }
};

(async function() {
  var err;
  try {
    return (await registry.register(module.exports));
  } catch (error) {
    err = error;
    console.error(err.stack);
    return process.exit(1);
  }
})();
