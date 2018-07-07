
nikita = require '../../src'
test = require '../test'
they = require 'ssh2-they'

describe 'service.action', ->
  
  @timeout 30000
  config = test.config()
  return if config.disable_service_systemctl

  they.only 'should start', (ssh) ->
    nikita
      ssh: ssh
    .service.remove
      name: config.service.name
    .service
      name: config.service.name
      srv_name: config.service.srv_name
      action: 'start'
    , (err, {status}) ->
      status.should.be.true()
    .service.status
      name: config.service.srv_name
    , (err, {status}) ->
      status.should.be.true()
    .service # Detect already started
      srv_name: config.service.srv_name
      action: 'start'
    , (err, {status}) ->
      status.should.be.false()
    .promise()

  they 'should stop', (ssh) ->
    nikita
      ssh: ssh
    .service.remove
      name: config.service.name
    .service
      name: config.service.name
      srv_name: config.service.srv_name
      action: 'stop'
    , (err, {status}) ->
      status.should.be.true() unless err
    .service.status
      name: config.service.srv_name
    , (err, {status}) ->
      status.should.be.false() unless err
    .service # Detect already stopped
      srv_name: config.service.srv_name
      action: 'stop'
    , (err, {status}) ->
      status.should.be.false() unless err
    .promise()

  they 'should restart', (ssh) ->
    nikita
      ssh: ssh
    .service.remove
      name: config.service.name
    .service
      name: config.service.name
      srv_name: config.service.srv_name
      action: 'start'
    .service
      srv_name: config.service.srv_name
      action: 'restart'
    , (err, {status}) ->
      status.should.be.true()
    .service.stop
      name: config.service.srv_name
    .service
      srv_name: config.service.srv_name
      action: 'restart'
    , (err, {status}) ->
      status.should.be.false()
    .promise()
