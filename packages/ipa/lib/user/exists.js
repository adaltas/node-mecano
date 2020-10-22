// Generated by CoffeeScript 2.5.1
// # `nikita.ipa.user.exists`

// Check if a user exists inside FreeIPA.

// ## Example

// ```js
// require('nikita')
// .ipa.user.exists({
//   uid: 'someone',
//   connection: {
//     url: "https://ipa.domain.com/ipa/session/json",
//     principal: "admin@DOMAIN.COM",
//     password: "mysecret"
//   }
// }, function(err, {status, exists}){
//   console.info(err ? err.message : status ?
//     'User was updated' : 'User was already set')
// })
// ```

// ## Hooks
var handler, on_action, schema;

on_action = function({config}) {
  if (config.uid == null) {
    config.uid = config.username;
  }
  return delete config.username;
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'uid': {
      type: 'string',
      description: `Name of the user to check for existence, same as the \`username\`.`
    },
    'username': {
      type: 'string',
      description: `Name of the user to check for existence, alias of \`uid\`.`
    },
    'connection': {
      $ref: 'module://@nikitajs/network/src/http',
      required: ['principal', 'password']
    }
  },
  required: ['connection', 'uid']
};

// ## Handler
handler = async function({config}) {
  var base, err;
  if ((base = config.connection.http_headers)['Referer'] == null) {
    base['Referer'] = config.connection.referer || config.connection.url;
  }
  try {
    await this.ipa.user.show({
      connection: config.connection,
      uid: config.uid
    });
    return {
      status: true,
      exists: true
    };
  } catch (error) {
    err = error;
    if (err.code !== 4001) { // user not found
      throw err;
    }
    return {
      status: false,
      exists: false
    };
  }
};

// ## Export
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  schema: schema,
  shy: true
};
