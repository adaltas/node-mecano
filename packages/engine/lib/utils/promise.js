// Generated by CoffeeScript 2.5.1
module.exports = {
  is: function(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
  }
};