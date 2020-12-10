// Generated by CoffeeScript 2.5.1
// # `nikita.ssh.root`

// Prepare the system to receive password-less root login with SSL/TLS keys.

// Prior executing this handler, a user with appropriate sudo permissions must be 
// created. The script will use those credentials
// to loggin and will try to become root with the "sudo" command. Use the "command" 
// property if you must use a different command (such as "sudo su -").

// Additionnally, it disables SELINUX which require a restart. The restart is 
// handled by Masson and the installation procedure will continue as soon as an 
// SSH connection is again available.

// ## Example

// ```js
// const {status} = await nikita.ssh.root({
//   "username": "vagrant",
//   "private_key_path": "/Users/wdavidw/.vagrant.d/insecure_private_key"
//   "public_key_path": "~/.ssh/id_rsa.pub"
// })
// console.info(`Public key was updoaded for root user: ${status}`)
// ```

// ## Schema
var connect, exec, fs, handler, schema, utils;

schema = {
  type: 'object',
  properties: {
    'command': {
      oneOf: [
        {
          type: 'string'
        },
        {
          typeof: 'function'
        }
      ]
    },
    'host': {
      type: 'string',
      // oneOf: [{format: 'ipv4'}, {format: 'hostname'}]
      default: 'root',
      description: `Command used to become the root user on the remote server, for exemple
\`su -\`.`
    },
    'password': {
      type: 'string',
      description: `Password of the user with sudo permissions to establish the SSH
connection  if no private key is provided.`
    },
    'port': {
      type: 'integer',
      default: 22,
      description: `          `
    },
    'private_key': {
      type: 'string',
      description: `Private key of the user with sudo permissions to establish the SSH
connection if \`password\` is not provided.`
    },
    'private_key_path': {
      type: 'string',
      description: `Local file location of the private key of the user with sudo
permissions and used to establish the SSH connection if \`password\` and
\`private_key\` are not provided.`
    },
    'public_key': {
      oneOf: [
        {
          type: 'string'
        },
        {
          instanceof: 'Buffer'
        }
      ],
      description: `Public key added to "authorized_keys" to enable the root user.`
    },
    'public_key_path': {
      type: 'string',
      description: `Local path to the public key added to "authorized_keys" to enable the
root  user.`
    },
    'selinux': {
      oneOf: [
        {
          type: 'string',
          enum: ['disabled',
        'enforcing',
        'permissive']
        },
        {
          type: 'boolean'
        }
      ],
      default: 'permissive',
      description: `Username of the user with sudo permissions to establish the SSH
connection.`
    },
    'username': {
      type: 'string',
      description: `Username of the user with sudo permissions to establish the SSH
connection.`
    }
  }
};

// ## Handler
handler = async function({
    metadata,
    config,
    tools: {log}
  }) {
  var err, location, rebooting, ref;
  log({
    message: "Entering ssh.root",
    level: 'DEBUG',
    module: 'nikita/lib/ssh/root'
  });
  if (config.host == null) {
    config.host = config.ip;
  }
  // config.command ?= 'su -'
  if (config.username == null) {
    config.username = null;
  }
  if (config.password == null) {
    config.password = null;
  }
  if (config.selinux == null) {
    config.selinux = false;
  }
  if (config.selinux === true) {
    config.selinux = 'permissive';
  }
  if (config.selinux && ((ref = config.selinux) !== 'enforcing' && ref !== 'permissive' && ref !== 'disabled')) {
    // Validation
    throw Error(`Invalid option \"selinux\": ${config.selinux}`);
  }
  rebooting = false;
  // Read public key if option is a path
  if (config.public_key_path && !config.public_key) {
    location = (await utils.tilde.normalize(config.public_key_path));
    try {
      ({
        data: config.public_key
      } = (await fs.readFile(location, 'ascii')));
    } catch (error) {
      err = error;
      if (err.code === 'ENOENT') {
        throw Error(`Private key doesnt exists: ${JSON.stringify(location)}`);
      }
      throw err;
    }
  }
  // Read private key if option is a path
  if (config.private_key_path && !config.private_key) {
    log({
      message: `Read Private Key: ${JSON.stringify(config.private_key_path)}`,
      level: 'DEBUG',
      module: 'nikita/lib/ssh/root'
    });
    location = (await utils.tilde.normalize(config.private_key_path));
    try {
      ({
        data: config.private_key
      } = (await fs.readFile(location, 'ascii')));
    } catch (error) {
      err = error;
      if (err.code === 'ENOENT') {
        throw Error(`Private key doesnt exists: ${JSON.stringify(location)}`);
      }
      throw err;
    }
  }
  await this.call(async function() {
    var child, command, conn;
    log({
      message: "Connecting",
      level: 'DEBUG',
      module: 'nikita/lib/ssh/root'
    });
    conn = !metadata.dry ? (await connect(config)) : null;
    log({
      message: "Connected",
      level: 'INFO',
      module: 'nikita/lib/ssh/root'
    });
    command = [];
    command.push(`sed -i.back 's/.*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config;`);
    if (config.public_key) {
      command.push(`mkdir -p /root/.ssh; chmod 700 /root/.ssh;
echo '${config.public_key}' >> /root/.ssh/authorized_keys;`);
    }
    command.push(`sed -i.back 's/.*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config;
selinux="${config.selinux || ''}";
if [ -n "$selinux" ] && [ -f /etc/selinux/config ] && grep ^SELINUX="$selinux" /etc/selinux/config;
then
  sed -i.back "s/^SELINUX=enforcing/SELINUX=$selinux/" /etc/selinux/config;
  ( reboot )&
  exit 2;
fi;`);
    command = command.join('\n');
    if (config.username !== 'root') {
      command = command.replace(/\n/g, ' ');
      if (typeof config.command === 'function') {
        command = config.command(command);
      } else if (typeof config.command === 'string') {
        command = `${config.command} ${command}`;
      } else {
        config.command = 'sudo ';
        if (config.user) {
          config.command += `-u ${config.user} `;
        }
        if (config.password) {
          config.command = `echo -e \"${config.password}\\n\" | ${config.command} -S `;
        }
        config.command += `-- sh -c \"${command}\"`;
        command = config.command;
      }
    }
    log({
      message: "Enable Root Access",
      level: 'DEBUG',
      module: 'nikita/lib/ssh/root'
    });
    log({
      message: command,
      type: 'stdin',
      module: 'nikita/lib/ssh/root'
    });
    if (!metadata.dry) {
      child = exec({
        ssh: conn,
        command: command
      }, (err) => {
        if ((err != null ? err.code : void 0) === 2) {
          log({
            message: "Root Access Enabled",
            level: 'WARN',
            module: 'nikita/lib/ssh/root'
          });
          err = null;
          return rebooting = true;
        } else {
          throw err;
        }
      });
      child.stdout.on('data', (data) => {
        return log({
          message: data,
          type: 'stdout',
          module: 'nikita/lib/ssh/root'
        });
      });
      child.stdout.on('end', (data) => {
        return log({
          message: null,
          type: 'stdout',
          module: 'nikita/lib/ssh/root'
        });
      });
      child.stderr.on('data', (data) => {
        return log({
          message: data,
          type: 'stderr',
          module: 'nikita/lib/ssh/root'
        });
      });
      return child.stderr.on('end', (data) => {
        return log({
          message: null,
          type: 'stderr',
          module: 'nikita/lib/ssh/root'
        });
      });
    }
  });
  return this.call({
    retry: true,
    sleep: 3000,
    if: rebooting
  }, async function() {
    var conn;
    conn = (await connect(config));
    return conn.end();
  });
};

// ## Exports
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
fs = require('fs').promises;

connect = require('ssh2-connect');

exec = require('ssh2-exec');

utils = require('../../utils');
