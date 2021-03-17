// Generated by CoffeeScript 2.5.1
var selfTemplated;

selfTemplated = require('self-templated');

module.exports = {
  name: '@nikitajs/core/lib/plugins/templated',
  hooks: {
    'nikita:action': {
      after: ['@nikitajs/core/lib/plugins/schema'],
      // '@nikitajs/core/lib/plugins/metadata/tmpdir'
      handler: async function(action) {
        var templated;
        templated = (await action.tools.find(function(action) {
          return action.metadata.templated;
        }));
        if (templated === false) {
          return;
        }
        return selfTemplated(action, {
          array: true,
          compile: false,
          mutate: true,
          partial: {
            metadata: true,
            config: true
          }
        });
      }
    }
  }
};
