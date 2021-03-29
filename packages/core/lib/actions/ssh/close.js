// Generated by CoffeeScript 2.5.1
// # `nikita.ssh.close`

// Close the existing connection if any.

// ## Configuration

// * `ssh` (boolean)   
//   Return the SSH connection if any and if true, null if false.

// ## Schema
var handler, schema;

schema = {
  config: {
    type: 'object',
    properties: {
      'ssh': {
        instanceof: 'Object',
        description: `The SSH connection to close, default to currently active SSH
connection avaible to the action.`
      }
    }
  }
};

// ## Handler
handler = function({config, siblings}) {
  var ref, ref1;
  if (config.ssh == null) {
    config.ssh = siblings.map(function({output}) {
      return output != null ? output.ssh : void 0;
    }).find(function(ssh) {
      return !!ssh;
    });
  }
  if (!config.ssh) {
    throw utils.error('NIKITA_SSH_CLOSE_NO_CONN', ['There is no connection to close,', 'either pass the connection in the `ssh` configuation', 'or ensure a connection was open in a sibling action']);
  }
  if (!(((ref = config.ssh._sshstream) != null ? ref.writable : void 0) && ((ref1 = config.ssh._sock) != null ? ref1.writable : void 0))) {
    // Exit if the connection is already close
    return false;
  }
  // Terminate the connection
  return new Promise(function(resolve, reject) {
    config.ssh.end();
    config.ssh.on('error', reject);
    return config.ssh.on('end', function() {
      return resolve(true);
    });
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};
