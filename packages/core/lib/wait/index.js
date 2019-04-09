// Generated by CoffeeScript 2.4.1
// # `nikita.wait`

// Simple nikita action that calls setTimeout. Thus, time is in millisecond.

// ## Options

// * `time` (number)    
//   Time in millisecond to wait to.   

// ## Example

// ```js
// before = Date.now();
// require('nikita')
// .wait({
//   time: 5000
// }, function(err, {status}){
//   throw Error 'TOO LATE!' if (Date.now() - before) > 5200
//   throw Error 'TOO SOON!' if (Date.now() - before) < 5000
// })
// ```

// ## Source Code
module.exports = function({options}, callback) {
  if (options.time == null) {
    options.time = options.argument;
  }
  if (options.time == null) {
    return callback(Error(`Missing time: ${JSON.stringify(options.time)}`));
  }
  if (typeof options.time === 'string') {
    options.time = parseInt(options.time);
  }
  if (typeof options.time !== 'number') {
    return callback(Error(`Invalid time format: ${JSON.stringify(options.time)}`));
  }
  return setTimeout(callback, options.time);
};
