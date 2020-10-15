
# `nikita.ssh.root`

Prepare the system to receive password-less root login with SSL/TLS keys.

Prior executing this handler, a user with appropriate sudo permissions must be 
created. The script will use those credentials
to loggin and will try to become root with the "sudo" command. Use the "cmd" 
property if you must use a different command (such as "sudo su -").

Additionnally, it disables SELINUX which require a restart. The restart is 
handled by Masson and the installation procedure will continue as soon as an 
SSH connection is again available.

## Exemple

```js
require('nikita')
.ssh.root({
  "username": "vagrant",
  "private_key_path": "/Users/wdavidw/.vagrant.d/insecure_private_key"
  "public_key_path": "~/.ssh/id_rsa.pub"
}, function(err){
  console.info(err || "Public key updoaded for root user");
});
```

## Schema

    schema =
      type: 'object'
      properties:
        'cmd':
          oneOf: [{type: 'string'}, {typeof: 'function'}]
        'host':
          type: 'string'
          # oneOf: [{format: 'ipv4'}, {format: 'hostname'}]
          default: 'root'
          description: """
          Command used to become the root user on the remote server, for exemple
          `su -`.
          """
        'password':
          type: 'string'
          description: """
          Password of the user with sudo permissions to establish the SSH
          connection  if no private key is provided.
          """
        'port':
          type: 'integer'
          default: 22
          description: """
          """
        'private_key':
          type: 'string'
          description: """
          Private key of the user with sudo permissions to establish the SSH
          connection if `password` is not provided.
          """
        'private_key_path':
          type: 'string'
          description: """
          Local file location of the private key of the user with sudo
          permissions and used to establish the SSH connection if `password` and
          `private_key` are not provided.
          """
        'public_key':
          oneOf: [{type: 'string'}, {instanceof: 'Buffer'}]
          description: """
          Public key added to "authorized_keys" to enable the root user.
          """
        'public_key_path':
          type: 'string'
          description: """
          Local path to the public key added to "authorized_keys" to enable the
          root  user.
          """
        'selinux':
          oneOf: [
            {type: 'string', enum: ['disabled', 'enforcing', 'permissive']},
            {type: 'boolean'}
          ]
          default: 'permissive'
          description: """
          Username of the user with sudo permissions to establish the SSH
          connection.
          """
        'username':
          type: 'string'
          description: """
          Username of the user with sudo permissions to establish the SSH
          connection.
          """

## Handler

    handler = ({metadata, config}) ->
      @log message: "Entering ssh.root", level: 'DEBUG', module: 'nikita/lib/ssh/root'
      config.host ?= config.ip
      # config.cmd ?= 'su -'
      config.username ?= null
      config.password ?= null
      config.selinux ?= false
      config.selinux = 'permissive' if config.selinux is true
      # Validation
      throw Error "Invalid option \"selinux\": #{config.selinux}" if config.selinux and config.selinux not in ['enforcing', 'permissive', 'disabled']
      rebooting = false
      # Read public key if option is a path
      if config.public_key_path and not config.public_key
        location = await tilde.normalize config.public_key_path
        try
          {data: config.public_key} = await fs.readFile location, 'ascii'
        catch err
          throw Error "Private key doesnt exists: #{JSON.stringify location}" if err.code is 'ENOENT'
          throw err
      # Read private key if option is a path
      if config.private_key_path and not config.private_key
        @log message: "Read Private Key: #{JSON.stringify config.private_key_path}", level: 'DEBUG', module: 'nikita/lib/ssh/root'
        location = await tilde.normalize config.private_key_path
        try
          {data: config.private_key} = await fs.readFile location, 'ascii'
        catch err
          throw Error "Private key doesnt exists: #{JSON.stringify location}" if err.code is 'ENOENT'
          throw err
      await @call ->
        @log message: "Connecting", level: 'DEBUG', module: 'nikita/lib/ssh/root'
        conn = unless metadata.dry
        then await connect config
        else null
        @log message: "Connected", level: 'INFO', module: 'nikita/lib/ssh/root'
        cmd = []
        cmd.push """
        sed -i.back 's/.*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config;
        """
        cmd.push """
        mkdir -p /root/.ssh; chmod 700 /root/.ssh;
        echo '#{config.public_key}' >> /root/.ssh/authorized_keys;
        """ if config.public_key
        cmd.push """
        sed -i.back 's/.*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config;
        selinux="#{config.selinux or ''}";
        if [ -n "$selinux" ] && [ -f /etc/selinux/config ] && grep ^SELINUX="$selinux" /etc/selinux/config;
        then
          sed -i.back "s/^SELINUX=enforcing/SELINUX=$selinux/" /etc/selinux/config;
          ( reboot )&
          exit 2;
        fi;
        """
        cmd = cmd.join '\n'
        if config.username isnt 'root'
          cmd = cmd.replace /\n/g, ' '
          if typeof config.cmd is 'function'
            cmd = config.cmd cmd
          else if typeof config.cmd is 'string'
            cmd = "#{config.cmd} #{cmd}"
          else
            config.cmd = 'sudo '
            config.cmd += "-u #{config.user} " if config.user
            config.cmd = "echo -e \"#{config.password}\\n\" | #{config.cmd} -S " if config.password
            config.cmd += "-- sh -c \"#{cmd}\""
            cmd = config.cmd
        @log message: "Enable Root Access", level: 'DEBUG', module: 'nikita/lib/ssh/root'
        @log message: cmd, type: 'stdin', module: 'nikita/lib/ssh/root'
        unless metadata.dry
          child = exec
            ssh: conn
            cmd: cmd
          , (err) =>
            if err?.code is 2
              @log message: "Root Access Enabled", level: 'WARN', module: 'nikita/lib/ssh/root'
              err = null
              rebooting = true
            else throw err
          child.stdout.on 'data', (data) =>
            @log message: data, type: 'stdout', module: 'nikita/lib/ssh/root'
          child.stdout.on 'end', (data) =>
            @log message: null, type: 'stdout', module: 'nikita/lib/ssh/root'
          child.stderr.on 'data', (data) =>
            @log message: data, type: 'stderr', module: 'nikita/lib/ssh/root'
          child.stderr.on 'end', (data) =>
            @log message: null, type: 'stderr', module: 'nikita/lib/ssh/root'
      @call retry: true, sleep: 3000, if: rebooting, ->
        conn = await connect config
        conn.end()

## Exports

    module.exports =
      handler: handler
      schema: schema

## Dependencies

    fs = require('fs').promises
    connect = require 'ssh2-connect'
    exec = require 'ssh2-exec'
    tilde = require '../../utils/tilde'
