// Generated by CoffeeScript 2.2.4
// # `nikita.fs.readFile(options, callback)`

// Options:

// * `target` (string)   
//   Path of the file to read; required.
// * `encoding` (string)
//   Return a string with a particular encoding, otherwise a buffer is returned; 
//   optional.

// ## Source Code
module.exports = {
  status: false,
  handler: function(options, callback) {
    var buffers;
    options.log({
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
      var result;
      result = Buffer.concat(buffers);
      if (options.encoding) {
        result = result.toString(options.encoding);
      }
      return callback(err, result);
    });
  }
};