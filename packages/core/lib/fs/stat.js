// Generated by CoffeeScript 2.4.1
// # `nikita.fs.stat`

// Retrieve file information.

// ## Options

// * `dereference` (boolean)   
//   Follow links, similar to `lstat`, default is "true".
// * `target` (string)   
//   Path to the file to analyse.

// ## Output parameters

// The parameters include a subset as the one of the Node.js native 
// [`fs.Stats`](https://nodejs.org/api/fs.html#fs_class_fs_stats) object.

// * `mode` (integer)   
//   A bit-field describing the file type and mode.
// * `uid` (integer)   
//   The numeric user identifier of the user that owns the file (POSIX).
// * `gid` (integer)   
//   The numeric group identifier of the group that owns the file (POSIX).
// * `size` (integer)   
//   The size of the file in bytes.
// * `atime` (integer)   
//   The timestamp indicating the last time this file was accessed expressed in milliseconds since the POSIX Epoch.
// * `mtime` (integer)   
//   The timestamp indicating the last time this file was modified expressed in milliseconds since the POSIX Epoch.

// ## File information

// The `mode` parameter indicates the file type. For conveniency, the 
// `nikita/misc/stats` module provide functions to check each possible file types.

// ## Examples

// Check if target is a file:

// ```js
// stats = require('@nikitajs/core/lib/misc/stats')
// require('nikita')
// .file.touch("#{scratch}/a_file")
// .fs.stat("#{scratch}/a_file", function(err, {stats}){
//   assert(stats.isFile(stats.mode) === true)
// })
// ```

// Check if target is a directory:

// ```js
// stats = require('@nikitajs/core/lib/misc/stats')
// require('nikita')
// .system.mkdir("#{scratch}/a_file")
// .fs.stat("#{scratch}/a_file", function(err, {stats}){
//   assert(stats.isDirectory(stats.mode) === true)
// })
// ```

// ## Note

// The `stat` command return an empty stdout in some circounstances like uploading
// a large file with `file.download`, thus the activation of `retry` and `sleep`
// options.

// ## Source Code
var constants;

module.exports = {
  status: false,
  log: false,
  handler: function({options}, callback) {
    var dereference;
    this.log({
      message: "Entering fs.stat",
      level: 'DEBUG',
      module: 'nikita/lib/fs/stat'
    });
    if (options.argument != null) {
      // Normalize options
      options.target = options.argument;
    }
    if (options.dereference == null) {
      options.dereference = true;
    }
    dereference = options.dereference ? '-L' : '';
    if (!options.target) {
      throw Error("Required Option: the \"target\" option is mandatory");
    }
    return this.system.execute({
      cmd: `[ ! -e ${options.target} ] && exit 3\nif [ -d /private ]; then\n  stat ${dereference} -f '%Xp|%u|%g|%z|%a|%m' ${options.target} # MacOS\nelse\n  stat ${dereference} -c '%f|%u|%g|%s|%X|%Y' ${options.target} # Linux\nfi`,
      sudo: options.sudo,
      bash: options.bash,
      arch_chroot: options.arch_chroot,
      trim: true
    }, function(err, {stdout}) {
      var atime, gid, mode, mtime, rawmodehex, size, uid;
      if ((err != null ? err.code : void 0) === 3) {
        err = Error(`Missing File: no file exists for target ${JSON.stringify(options.target)}`);
        err.code = 'ENOENT';
        return callback(err);
      }
      if (err) {
        return callback(err);
      }
      [rawmodehex, uid, gid, size, atime, mtime] = stdout.split('|');
      mode = parseInt('0x' + rawmodehex, 16);
      if (isNaN(mode)) {
        return retry_callback(Error(`System Kaput: invalid stdout, got ${JSON.stringify(stdout)}`));
      }
      return callback(null, {
        stats: {
          mode: mode,
          uid: parseInt(uid, 10),
          gid: parseInt(gid, 10),
          size: parseInt(size, 10),
          atime: parseInt(atime, 10),
          mtime: parseInt(mtime, 10)
        }
      });
    });
  }
};

// ## Stat implementation

// On Linux, the format argument is '-c'. The following codes are used:

// - `%f`  The raw mode in hexadecimal.
// - `%u`  The user ID of owner.
// - `%g`  The group ID of owner.
// - `%s`  The block size of file.
// - `%X`  The time of last access, seconds since Epoch.
// - `%y`  The time of last modification, human-readable.

// On MacOS, the format argument is '-f'. The following codes are used:

// - `%Xp` File type and permissions in hexadecimal.
// - `%u`  The user ID of owner.
// - `%g`  The group ID of owner.
// - `%z`  The size of file in bytes.
// - `%a`  The time file was last accessed.
// - `%m`  The time file was last modified.

// ## Dependencies
constants = require('fs').constants;
