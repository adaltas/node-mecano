
{EventEmitter} = require 'events'
stream = require 'stream'
nikita = require '../../src'
test = require '../test'
they = require 'ssh2-they'

describe 'system.execute', ->

  scratch = test.scratch @

  they 'in generated path', (ssh) ->
    nikita
      ssh: ssh
    .system.execute
      cmd: "echo $BASH"
      bash: true
    , (err, {stdout}) ->
      stdout.should.containEql 'bash'
    .promise()

  they 'in user path', (ssh) ->
    nikita
      ssh: ssh
    .system.execute
      cmd: "echo $BASH"
      bash: true
      dirty: true
      target: "#{scratch}/my_script"
    , (err, {stdout}) ->
      stdout.should.containEql 'bash'
    .file.assert
      target: "#{scratch}/my_script"
    .system.execute
      cmd: "echo $BASH"
      bash: true
      dirty: false
      target: "#{scratch}/my_script"
    , (err, {stdout}) ->
      stdout.should.containEql 'bash'
    .file.assert
      target: "#{scratch}/my_script"
      not: true
    .promise()

  they 'honors exit code', (ssh) ->
    nikita
      ssh: ssh
    .system.execute
      cmd: "exit 2"
      bash: true
      code_skipped: 2
    , (err, {status}) ->
      status.should.be.false() unless err
    .promise()
