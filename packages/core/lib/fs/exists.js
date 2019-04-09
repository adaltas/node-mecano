// Generated by CoffeeScript 2.4.1
// # `nikita.fs.exists`

// Retrieve file information. If path is a symbolic link, then the link itself is
// stat-ed, not the file that it refers to.

// ```js
// require(nikita)
// .fs.exists({
//   target: '/path/to/file'
// }, function(err, {exists}){
//   console.log(err ? err.message :
//     exists ? 'File exists' : 'File is missing')
// })
// ```

// ## Source Code
module.exports = {
  status: false,
  log: false,
  handler: function({options}, callback) {
    this.log({
      message: "Entering fs.exists",
      level: 'DEBUG',
      module: 'nikita/lib/fs/exists'
    });
    if (options.argument != null) {
      // Normalize options
      options.target = options.argument;
    }
    return this.fs.stat({
      target: options.target,
      dereference: true,
      sudo: options.sudo,
      bash: options.bash,
      arch_chroot: options.arch_chroot,
      relax: true
    }, function(err) {
      var exists;
      if ((err != null ? err.code : void 0) === 'ENOENT') {
        exists = false;
        err = null;
      } else if (!err) {
        exists = true;
      }
      return callback(err, {
        exists: exists
      });
    });
  }
};
