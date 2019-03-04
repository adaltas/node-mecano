// Generated by CoffeeScript 2.3.2
// # `nikita.ipa.user.show`

// Retrieve user information from FreeIPA.

// ## Options

// * `referer` (string, ?required)   
//   The HTTP referer of the request, required unless provided inside the `Referer`
//   header.
// * `uid` (string, required)   
//   Name of the user to add, same as the username.
// * `username` (string, required)   
//   Name of the user to add, alias of `uid`.
// * `url` (string, required)    
//   The IPA HTTP endpoint, for example "https://ipa.domain.com/ipa/session/json"

// ## Exemple

// ```js
// require('nikita')
// .ipa.user.show({
//   uid: 'someone',
//   referer: 'https://my.domain.com',
//   url: 'https://ipa.domain.com/ipa/session/json',
//   principal: 'admin@DOMAIN.COM',
//   password: 'XXXXXX'
// }, function(){
//   console.info(err ? err.message : status ?
//     'User was updated' : 'User was already set')
// })
// ```
var string;

module.exports = function({options}, callback) {
  var base;
  if (options.uid == null) {
    options.uid = options.username;
  }
  if (options.http_headers == null) {
    options.http_headers = {};
  }
  options.http_headers['Accept'] = 'applicaton/json';
  options.http_headers['Content-Type'] = 'application/json';
  if ((base = options.http_headers)['Referer'] == null) {
    base['Referer'] = options.referer;
  }
  if (!options.uid) {
    throw Error(`Required Option: uid is required, got ${options.uid}`);
  }
  if (!options.url) {
    throw Error(`Required Option: url is required, got ${options.url}`);
  }
  if (!options.principal) {
    throw Error(`Required Option: principal is required, got ${options.principal}`);
  }
  if (!options.password) {
    throw Error(`Required Option: password is required, got ${options.password}`);
  }
  if (!options.http_headers['Referer']) {
    throw Error(`Required Option: referer is required, got ${options.http_headers['Referer']}`);
  }
  return this.connection.http(options, {
    negotiate: true,
    url: options.url,
    method: 'POST',
    data: {
      method: "user_show/1",
      params: [[options.uid], {}],
      id: 0
    },
    http_headers: options.http_headers
  }, function(err, {data}) {
    var error;
    if (err) {
      return callback(err);
    }
    if (data.error) {
      error = Error(data.error.message);
      error.code = data.error.code;
      return callback(error);
    }
    return callback(null, {
      result: data.result.result
    });
  });
};

// ## Dependencies
string = require('@nikitajs/core/lib/misc/string');