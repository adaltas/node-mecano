
connect = require 'ssh2-connect'
nikita = require '../../src'
utils = require '../../src/utils'
{tags, ssh} = require '../test'
# All test are executed with an ssh connection passed as an argument
they = require('ssh2-they').configure ssh.filter (ssh) -> !!ssh

return unless tags.posix

describe 'ssh.open', ->

  they.skip 'with handler options', ({ssh}) ->
    nikita ->
      @call ->
        (!!@ssh()).should.be.false()
      # {status} = await @ssh.open
      #   host: ssh.config.host
      #   port: ssh.config.port
      #   username: ssh.config.username
      #   password: ssh.config.password
      #   private_key: ssh.config.privateKey
      #   public_key: ssh.config.publicKey
      # status.should.be.true()
      # @call ->
      #   (!!@ssh()).should.be.true()
      #   utils.ssh.is( @ssh() ).should.be.true()
      # @ssh.close()

  they.skip 'with global options', ({ssh}) ->
    nikita
      ssh:
        host: ssh.config.host
        port: ssh.config.port
        username: ssh.config.username
        password: ssh.config.password
        private_key: ssh.config.privateKey
        public_key: ssh.config.publicKey
    .ssh.open()
    .call ->
      (!!@ssh()).should.be.true()
      utils.ssh.is( @ssh() ).should.be.true()
    .ssh.close {}, (err, {status}) ->
      status.should.be.true() unless err
    .ssh.close {}, (err, {status}) ->
      status.should.be.false() unless err
    .promise()

  they.skip 'check status with properties', ({ssh}) ->
    options =
      host: ssh.config.host
      port: ssh.config.port
      username: ssh.config.username
      password: ssh.config.password
      private_key: ssh.config.privateKey
      public_key: ssh.config.publicKey
    nikita
    .ssh.open options
    .ssh.open options, (err, {status}) ->
      status.should.be.false() unless err
    .ssh.close()
    .promise()

  they.skip 'check status with instance', ({ssh}, next) ->
    connect
      host: ssh.config.host
      port: ssh.config.port
      username: ssh.config.username
      password: ssh.config.password
      private_key: ssh.config.privateKey
      public_key: ssh.config.publicKey
    , (err, ssh) ->
      return next err if err
      nikita
      .ssh.open ssh: ssh, (err, {status}) ->
        status.should.eql true unless err
      .ssh.open ssh: ssh, (err, {status}) ->
        status.should.be.false() unless err
      .ssh.close()
      .next (err) ->
        ssh.end()
        next err
