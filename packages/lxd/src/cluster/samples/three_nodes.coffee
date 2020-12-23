
path = require 'path'
nikita = require '@nikitajs/engine/src'
require '@nikitajs/lxd/src/register'
require '@nikitajs/tools/src/register'

###

Notes:

SSH private and public keys will be generated in an "assets" directory inside
the current working directory.

###

nikita
.log.cli pad: host: 20, header: 60
.lxd.cluster
  metadata: header: 'Container'
  networks:
    lxdbr0public:
      'ipv4.address': '172.16.0.1/24'
      'ipv4.nat': true
      'ipv6.address': 'none'
      'dns.domain': 'nikita'
    lxdbr1private:
      'ipv4.address': '10.10.10.1/24'
      'ipv4.nat': false
      'ipv6.address': 'none'
      'dns.domain': 'nikita'
  containers:
    n1:
      image: 'images:centos/7'
      disk:
        nikitadir:
          path: '/nikita'
          source: process.env['NIKITA_HOME'] or path.join(__dirname, '../../../../')
      nic:
        eth0:
          name: 'eth0', nictype: 'bridged', parent: 'lxdbr0public'
        eth1:
          name: 'eth1', nictype: 'bridged', parent: 'lxdbr1private'
          # Custom properties from nikita
          ip: '10.10.10.11', netmask: '255.255.255.0'
      proxy:
        ssh: listen: 'tcp:0.0.0.0:2201', connect: 'tcp:127.0.0.1:22'
      ssh: enabled: true
      user:
        nikita: sudo: true, authorized_keys: './assets/id_rsa.pub'
    n2:
      image: 'images:centos/7'
      disk:
        nikitadir:
          path: '/nikita'
          source: process.env['NIKITA_HOME'] or path.join(__dirname, '../../../../')
      nic:
        eth0:
          name: 'eth0', nictype: 'bridged', parent: 'lxdbr0public'
        eth1:
          name: 'eth1', nictype: 'bridged', parent: 'lxdbr1private'
          # Custom properties from nikita
          ip: '10.10.10.12', netmask: '255.255.255.0'
      proxy:
        ssh: listen: 'tcp:0.0.0.0:2202', connect: 'tcp:127.0.0.1:22'
      ssh: enabled: true
      user:
        nikita: sudo: true, authorized_keys: './assets/id_rsa.pub'
    n3:
      image: 'images:centos/7'
      disk:
        nikitadir:
          path: '/nikita'
          source: process.env['NIKITA_HOME'] or path.join(__dirname, '../../../../')
      nic:
        eth0:
          name: 'eth0', nictype: 'bridged', parent: 'lxdbr0public'
        eth1:
          name: 'eth1', nictype: 'bridged', parent: 'lxdbr1private'
          # Custom properties from nikita
          ip: '10.10.10.13', netmask: '255.255.255.0'
      proxy:
        ssh: listen: 'tcp:0.0.0.0:2203', connect: 'tcp:127.0.0.1:22'
      ssh: enabled: true
      user:
        nikita: sudo: true, authorized_keys: './assets/id_rsa.pub'
  prevision: ({config}) ->
    await @tools.ssh.keygen
      metadata: header: 'SSH key'
      target: './assets/id_rsa'
      bits: 2048
      key_format: 'PEM'
      comment: 'nikita'
  provision_container: ({config}) ->
    await @lxd.exec
      metadata: header: 'Node.js'
      container: config.container
      command: """
      command -v node && exit 42
      curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
      bash n lts
      """
      trap: true
      code_skipped: 42
    # @lxd.file.push
    #   debug: true
    #   header: 'Test configuration'
    #   container: options.container
    #   gid: 'nikita'
    #   uid: 'nikita'
    #   source: './test.coffee'
    #   target: '/nikita/packages/core/test.coffee'
