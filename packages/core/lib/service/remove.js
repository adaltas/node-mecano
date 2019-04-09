// Generated by CoffeeScript 2.4.1
// # `nikita.service.remove`

// Remove a package or service.

// ## Options

// * `cacheonly` (boolean)   
//   Run the yum command entirely from system cache, don't update cache.   
// * `name` (string)   
//   Service name.   
// * `ssh` (object|ssh2)   
//   Run the action on a remote server using SSH, an ssh2 instance or an
//   configuration object used to initialize the SSH connection.   

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Indicates if the startup behavior has changed.   

// ## Example

// ```js
// require('nikita')
// .service.start([{
//   ssh: ssh,
//   name: 'gmetad'
// }, function(err, {status}){ /* do sth */ });
// ```

// ## Source Code
var string;

module.exports = function({options}) {
  var cacheonly, installed;
  this.log({
    message: "Entering service.remove",
    level: 'DEBUG',
    module: 'nikita/lib/service/remove'
  });
  if (typeof options.argument === 'string') {
    // Options
    if (options.name == null) {
      options.name = options.argument;
    }
  }
  if (options.manager == null) {
    options.manager = this.store['nikita:service:manager'];
  }
  if (!options.name) {
    // Validation
    throw Error(`Invalid Name: ${JSON.stringify(options.name)}`);
  }
  // Action
  this.log({
    message: `Remove service ${options.name}`,
    level: 'INFO',
    module: 'nikita/lib/service/remove'
  });
  cacheonly = options.cacheonly ? '-C' : '';
  if (options.cache) {
    installed = this.store['nikita:execute:installed'];
  }
  this.system.execute({
    cmd: "if command -v yum >/dev/null 2>&1; then\n  rpm -qa --qf \"%{NAME}\n\"\nelif command -v pacman >/dev/null 2>&1; then\n  pacman -Qqe\nelif command -v apt-get >/dev/null 2>&1; then\n  dpkg -l | grep \'^ii\' | awk \'{print $2}\'\nelse\n  echo \"Unsupported Package Manager\" >&2\n  exit 2\nfi",
    code_skipped: 1,
    stdout_log: false,
    shy: true,
    unless: installed != null
  }, function(err, {status, stdout}) {
    var pkg;
    if ((err != null ? err.code : void 0) === 2) {
      throw Error("Unsupported Package Manager");
    }
    if (err) {
      throw err;
    }
    if (!status) {
      return;
    }
    this.log({
      message: "Installed packages retrieved",
      level: 'INFO',
      module: 'nikita/lib/service/remove'
    });
    return installed = (function() {
      var i, len, ref, results;
      ref = string.lines(stdout);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        pkg = ref[i];
        results.push(pkg);
      }
      return results;
    })();
  });
  this.system.execute({
    cmd: `if command -v yum >/dev/null 2>&1; then\n  yum remove -y ${cacheonly} '${options.name}'\nelif command -v pacman >/dev/null 2>&1; then\n  pacman --noconfirm -R ${options.name}\nelif command -v apt-get >/dev/null 2>&1; then\n  apt-get remove -y ${options.name}\nelse\n  echo "Unsupported Package Manager: yum, pacman, apt-get supported" >&2\n  exit 2\nfi`,
    code_skipped: 3,
    if: function() {
      return installed.indexOf(options.name) !== -1;
    }
  }, function(err, {status}) {
    if (err) {
      throw Error(`Invalid Service Name: ${options.name}`);
    }
    // Update list of installed packages
    installed.splice(installed.indexOf(options.name), 1);
    // Log information
    return this.log(status ? {
      message: "Service removed",
      level: 'WARN',
      module: 'nikita/lib/service/remove'
    } : {
      message: "Service already removed",
      level: 'INFO',
      module: 'nikita/lib/service/remove'
    });
  });
  return this.call({
    if: options.cache,
    handler: function() {
      this.log({
        message: "Caching installed on \"nikita:execute:installed\"",
        level: 'INFO',
        module: 'nikita/lib/service/remove'
      });
      return this.store['nikita:execute:installed'] = installed;
    }
  });
};

// ## Dependencies
string = require('../misc/string');
