
nikita = require '../../src'
they = require 'ssh2-they'
test = require '../test'

describe 'fs.exists', ->

  scratch = test.scratch @

  they 'does not exists', (ssh) ->
    nikita
      ssh: ssh
    .fs.exists
      target: "#{scratch}/not_here"
    , (err, {exists}) ->
      exists.should.be.false() unless err
    .promise()

  they 'exists', (ssh) ->
    nikita
      ssh: ssh
    .file
      target: "#{scratch}/a_file"
      content: "some content"
    .fs.exists
      target: "#{scratch}/a_file"
    , (err, {exists}) ->
      exists.should.be.true() unless err
    .promise()

  they 'option argument default to target', (ssh) ->
    nikita
      ssh: ssh
    .file.touch "#{scratch}/a_file"
    .fs.exists "#{scratch}/a_file"
    , (err, {exists}) ->
      exists.should.be.true() unless err
    .promise()
