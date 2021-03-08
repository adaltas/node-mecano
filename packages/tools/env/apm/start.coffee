
path = require 'path'
nikita = require '@nikitajs/core/lib'
require '@nikitajs/lxd/lib/register'
require '@nikitajs/tools/lib/register'

# Note:
# Dec 4th, 2020: upgrading Atom to 1.52.0 or 1.53.0 on centos7 20201203_07:08
# lead to an error while running `apm`
# "Error: /lib64/libstdc++.so.6: version `CXXABI_1.3.9' not found"
# issue is open on the moment - https://github.com/atom/atom/issues/21497

nikita
.log.cli pad: host: 20, header: 60
.log.md filename: '/tmp/nikita_tools_apm_lxd_install'
.lxd.cluster
  $header: 'Container'
  containers:
    'nikita-tools-apm':
      image: 'images:centos/7'
      properties:
        'environment.NIKITA_TEST_MODULE': '/nikita/packages/tools/env/apm/test.coffee'
      disk:
        nikitadir:
          path: '/nikita'
          source: process.env['NIKITA_HOME'] or path.join(__dirname, '../../../../')
      ssh: enabled: true
  provision_container: ({config}) ->
    await @lxd.exec
      $header: 'Node.js'
      container: config.container
      command: """
      command -v node && exit 42
      NODE_VERSION=12.13.1
      yum install -y xz
      curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o /tmp/node.tar.xz
      tar -xJf "/tmp/node.tar.xz" -C /usr/local --strip-components=1
      rm -f "/tmp/node.tar.xz"
      """
      trap: true
      code_skipped: 42
    await @lxd.exec
      $header: 'SSH keys'
      container: config.container
      command: """
      mkdir -p /root/.ssh && chmod 700 /root/.ssh
      if [ ! -f /root/.ssh/id_rsa ]; then
        ssh-keygen -t rsa -f /root/.ssh/id_rsa -N ''
        cat /root/.ssh/id_rsa.pub > /root/.ssh/authorized_keys
      fi
      """
      trap: true
    await @lxd.exec
      $header: 'Install Atom'
      container: config.container
      command: """
      apm -v | grep apm && exit 42
      yum install -y wget
      wget https://github.com/atom/atom/releases/download/v1.51.0/atom.x86_64.rpm
      yum install -y atom.x86_64.rpm
      """
      trap: true
      code_skipped: 42
