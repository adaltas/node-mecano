// Generated by CoffeeScript 2.5.1
// # SSH keygen

// Generates keys for use by SSH protocol version 2.

// ## Example

// Force the generation of a key compatible with SSH2. For example in OSX Mojave,
// the default export format is RFC4716.

// ```js
// const {status} = await nikita.tools.ssh.keygen({
//   bits: 2048,
//   comment: 'my@email.com',
//   target: './id_rsa',
//   key_format: 'PEM'
// })
// console.info(`Key was generated: ${status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'bits': {
      type: 'number',
      default: 4096,
      description: `Specifies the number of bits in the key to create.`
    },
    'comment': {
      type: 'string',
      description: `Comment such as a name or email.`
    },
    'key_format': {
      type: 'string',
      description: `Specify a key format. The supported key formats are: \`RFC4716\` (RFC
4716/SSH2 public or private key), \`PKCS8\` (PEM PKCS8 public key) or
\`PEM\` (PEM public key).`
    },
    'passphrase': {
      type: 'string',
      default: '',
      description: `Key passphrase, empty string for no passphrase.`
    },
    'target': {
      type: 'string',
      description: `Path of the generated private key.`
    },
    'type': {
      type: 'string',
      default: 'rsa',
      description: `Type of key to create.`
    }
  },
  required: ['target']
};

// ## Handler
handler = async function({
    config,
    tools: {path}
  }) {
  var ref;
  if (config.key_format && ((ref = config.key_format) !== 'RFC4716' && ref !== 'PKCS8' && ref !== 'PEM')) {
    throw Error(`Invalid Option: key_format must be one of RFC4716, PKCS8 or PEM, got ${JSON.stringify(config.key_format)}`);
  }
  await this.fs.mkdir({
    target: `${path.dirname(config.target)}`
  });
  return (await this.execute({
    unless_exists: `${config.target}`,
    command: [
      'ssh-keygen',
      "-q", // Silence
      `-t ${config.type}`,
      `-b ${config.bits}`,
      config.key_format ? `-m ${config.key_format}` : void 0,
      config.comment ? `-C '${config.comment.replace('\'',
      '\\\'')}'` : void 0,
      `-N '${config.passphrase.replace('\'',
      '\\\'')}'`,
      `-f ${config.target}`
    ].join(' ')
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};
