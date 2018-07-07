
nikita = require '../../src'
test = require '../test'
they = require 'ssh2-they'

describe 'system.group', ->
  
  config = test.config()
  return if config.disable_system_user
  scratch = test.scratch @
  
  they 'accept only user name', (ssh) ->
    nikita
      ssh: ssh
    .system.user.remove 'toto'
    .system.group.remove 'toto'
    .system.group 'toto', (err, {status}) ->
      status.should.be.true() unless err
    .system.group 'toto', (err, {status}) ->
      status.should.be.false() unless err
    .promise()

  they 'accept gid as int or string', (ssh) ->
    nikita
      ssh: ssh
    .system.user.remove 'toto'
    .system.group.remove 'toto'
    .system.group 'toto', gid: '1234', (err, {status}) ->
      status.should.be.true() unless err
    .system.group 'toto', gid: '1234', (err, {status}) ->
      status.should.be.false() unless err
    .system.group 'toto', gid: 1234, (err, {status}) ->
      status.should.be.false() unless err
    .promise()

  they 'throw if empty gid string', (ssh) ->
    nikita
      ssh: ssh
    .system.group.remove 'toto'
    .system.group 'toto', gid: '', relax: true, (err) ->
      err.message.should.eql 'Invalid gid option'
    .promise()
  
  they 'clean the cache', (ssh) ->
    nikita
      ssh: ssh
    .system.group.remove 'toto'
    .call ->
      (@store['nikita:etc_group'] is undefined).should.be.true()
    .file.types.etc_group.read cache: true, (err) ->
      @store['nikita:etc_group'].should.be.an.Object() unless err
    .system.group 'toto', cache: true, (err) ->
      (@store['nikita:etc_group'] is undefined).should.be.true() unless err
    .promise()
    
