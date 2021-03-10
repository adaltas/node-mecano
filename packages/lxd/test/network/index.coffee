
nikita = require '@nikitajs/core/lib'
{tags, config} = require '../test'
they = require('mocha-they')(config)

return unless tags.lxd

describe 'lxc.network.create', ->
  
  they 'schema dns.domain', ({ssh}) ->
    nikita
      $ssh: ssh
    , ->
      @lxc.network.delete
        network: "testnet0"
      await @lxc.network
        network: "testnet0"
        properties:
          'ipv4.address': '192.0.2.1/30'
          'dns.domain': 'nikita.local'
      @lxc.network
        network: "testnet0"
        properties:
          'ipv4.address': '192.0.2.1/30'
          'dns.domain': '(oo)'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'

  they 'Create a new network', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      await registry.register 'clean', ->
        @lxc.network.delete
          network: "testnet0"
      try
        @clean()
        {$status} = await @lxc.network
          network: "testnet0"
        $status.should.be.true()
      finally
        @clean()

  they 'Different types of config parameters', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      await registry.register 'clean', ->
        @lxc.network.delete
          network: "testnet0"
      try
        {$status} = await @lxc.network
          network: "testnet0"
          properties:
            'ipv4.address': "192.0.2.1/30"
            'ipv4.dhcp': false
            'bridge.mtu': 2000
        $status.should.be.true()
      finally
        @clean()

  they 'Network already created', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      await registry.register 'clean', ->
        @lxc.network.delete
          network: "testnet0"
      try
        @lxc.network
          network: "testnet0"
        {$status} = await @lxc.network
          network: "testnet0"
        $status.should.be.false()
      finally
        @clean()

  they 'Add new properties', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      await registry.register 'clean', ->
        @lxc.network.delete
          network: "testnet0"
      try
        @lxc.network
          network: "testnet0"
        {$status} = await @lxc.network
          network: "testnet0"
          properties:
            'ipv4.address': "192.0.2.1/30"
            'ipv4.dhcp': false
        $status.should.be.true()
      finally
        @clean()

  they 'Change a property', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      await registry.register 'clean', ->
        @lxc.network.delete
          network: "testnet0"
      try
        {$status} = await @lxc.network
          network: "testnet0"
          properties:
            'ipv4.address': "192.0.2.1/30"
            'ipv4.dhcp': true
        $status.should.be.true()
        {$status} = await @lxc.network
          network: "testnet0"
          properties:
            'ipv4.address': "192.0.2.1/30"
            'ipv4.dhcp': true
        $status.should.be.false()
        {$status} = await @lxc.network
          network: "testnet0"
          properties:
            'ipv4.address': "192.0.2.1/30"
            'ipv4.dhcp': false
        $status.should.be.true()
      finally
        @clean()

  they 'Configuration unchanged', ({ssh}) ->
    nikita
      $ssh: ssh
    , ({registry}) ->
      await registry.register 'clean', ->
        @lxc.network.delete
          network: "testnet0"
      try
        @lxc.network
          network: "testnet0"
          properties:
            'ipv4.address': "192.0.2.1/30"
        {$status} = await @lxc.network
          network: "testnet0"
          properties:
            'ipv4.address': "192.0.2.1/30"
        $status.should.be.false()
      finally
        @clean()
