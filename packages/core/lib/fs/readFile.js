// Generated by CoffeeScript 2.4.1
// # `nikita.fs.readFile(options, callback)`

// Options:

// * `target` (string)   
//   Path of the file to read; required.
// * `encoding` (string)
//   Return a string with a particular encoding, otherwise a buffer is returned; 
//   optional.

// Exemple:

// ```js
// require('nikita')
// .fs.readFile({
//   target: "#{scratch}/a_file",
//   encoding: 'ascii'
// }, function(err, {data}){
//   assert(data, 'hello')
// })
// ```

// ## Source Code
module.exports = {
  status: false,
  log: false,
  handler: function({options}, callback) {
    var buffers;
    this.log({
      message: "Entering fs.readFile",
      level: 'DEBUG',
      module: 'nikita/lib/fs/readFile'
    });
    if (options.argument != null) {
      // Normalize options
      options.target = options.argument;
    }
    if (!options.target) {
      throw Error("Required Option: the \"target\" option is mandatory");
    }
    buffers = [];
    return this.fs.createReadStream({
      target: options.target,
      on_readable: function(rs) {
        var buffer, results;
        results = [];
        while (buffer = rs.read()) {
          results.push(buffers.push(buffer));
        }
        return results;
      }
    }, function(err) {
      var data;
      data = Buffer.concat(buffers);
      if (options.encoding) {
        data = data.toString(options.encoding);
      }
      return callback(err, {
        data: data
      });
    });
  }
};
