// Generated by CoffeeScript 2.5.1
// Nikita

// This is the main Nikita entry point. It expose a function to initialize a new
// Nikita session.
var create, session;

require('./register');

session = require('./session');

create = function() {
  return session({
    plugins: [require('./metadata/debug'), require('./metadata/depth'), require('./metadata/disabled'), require('./metadata/raw'), require('./metadata/relax'), require('./metadata/retry'), require('./metadata/ssh'), require('./metadata/status'), require('./metadata/tmpdir'), require('./plugins/args'), require('./plugins/conditions'), require('./plugins/conditions_exists'), require('./plugins/history'), require('./plugins/log'), require('./plugins/operation_events'), require('./plugins/operation_find'), require('./plugins/operation_path'), require('./plugins/operation_walk'), require('./plugins/schema'), require('./plugins/templated')]
  }, ...arguments);
};

module.exports = new Proxy(create, {
  get: function(target, name) {
    return create()[name];
  }
});