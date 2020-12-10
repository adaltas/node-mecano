// Generated by CoffeeScript 2.5.1
// # `nikita.ipa.user.find`

// Find the users registed inside FreeIPA. "https://ipa.domain.com/ipa/session/json"

// ## Example

// ```js
// const {status} = await nikita.ipa.user.find({
//   criterias: {
//     in_group: ["user_find_group"]
//   }
//   connection: {
//     url: "https://ipa.domain.com/ipa/session/json",
//     principal: "admin@DOMAIN.COM",
//     password: "mysecret"
//   }
// })
// console.info(`User was found: ${status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'connection': {
      $ref: 'module://@nikitajs/network/src/http',
      required: ['principal', 'password']
    }
  },
  criterias: {
    type: 'object',
    properties: {
      'login': {
        type: 'string'
      },
      'first': {
        type: 'string'
      },
      'last': {
        type: 'string'
      },
      'cn': {
        type: 'string'
      },
      'displayname': {
        type: 'string'
      },
      'initials': {
        type: 'string'
      },
      'homedir': {
        type: 'string'
      },
      'gecos': {
        type: 'string'
      },
      'shell': {
        type: 'string'
      },
      'principal': {
        type: 'string'
      },
      'principal_expiration': {
        type: ['string', 'object'],
        instance_of: Date,
        format: 'date-time'
      },
      'password_expiration': {
        type: ['string', 'object'],
        instance_of: Date,
        format: 'date-time'
      },
      'email': {
        type: 'string'
      },
      'password': {
        type: 'string'
      },
      'uid': {
        type: 'integer'
      },
      'gidnumber': {
        type: 'integer'
      },
      'street': {
        type: 'string'
      },
      'city': {
        type: 'string'
      },
      'state': {
        type: 'string'
      },
      'postalcode': {
        type: 'string'
      },
      'phone': {
        type: 'string'
      },
      'mobile': {
        type: 'string'
      },
      'pager': {
        type: 'string'
      },
      'fax': {
        type: 'string'
      },
      'orgunit': {
        type: 'string'
      },
      'title': {
        type: 'string'
      },
      'manager': {
        type: 'string'
      },
      'carlicense': {
        type: 'string'
      },
      'ipauserauthtype': {
        type: 'string',
        enum: [
          'password',
          'radius',
          'otp' // user_auth_type
        ]
      },
      'class': {
        type: 'string'
      },
      'radius': {
        type: 'string'
      },
      'radius_username': {
        type: 'string'
      },
      'departmentnumber': {
        type: 'string'
      },
      'employeenumber': {
        type: 'string'
      },
      'employeetype': {
        type: 'string'
      },
      'preferredlanguage': {
        type: 'string'
      },
      'certificate': {
        type: 'string'
      },
      'disabled': {
        type: 'boolean'
      },
      'preserved': {
        type: 'boolean'
      },
      'timelimit': {
        type: 'integer'
      },
      'sizelimit': {
        type: 'integer'
      },
      'pkey_only': {
        type: 'string'
      },
      'in_group': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'not_in_group': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'in_netgroup': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'not_in_netgroup': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'in_role': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'not_in_role': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'in_hbacrule': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'not_in_hbacrule': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'in_sudorule': {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      'not_in_sudorule': {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    }
  }
};

// ## Handler
handler = async function({config}) {
  var base, data, error;
  if ((base = config.connection.http_headers)['Referer'] == null) {
    base['Referer'] = config.connection.referer || config.connection.url;
  }
  ({data} = (await this.network.http(config.connection, {
    negotiate: true,
    method: 'POST',
    data: {
      method: 'user_find/1',
      params: [[], config.criterias || {}],
      id: 0
    }
  })));
  if (data.error) {
    error = Error(data.error.message);
    error.code = data.error.code;
    throw error;
  }
  return {
    result: data.result.result
  };
};

// ## Export
module.exports = {
  handler: handler,
  schema: schema
};
