
nikita = require '../../src'
test = require '../test'
they = require 'ssh2-they'

describe 'system.move', ->

  scratch = test.scratch @

  they 'rename a file', (ssh) ->
    nikita
      ssh: ssh
    .file.touch
      target: "#{scratch}/org_file"
    .system.move
      target: "#{scratch}/new_name"
      source: "#{scratch}/org_file"
    , (err, {status}) ->
      status.should.be.true() unless err
    # The target file should exists
    .file.assert
      target: "#{scratch}/new_name"
    # The source file should no longer exists
    .file.assert
      target: "#{scratch}/org_file"
      not: true
    .promise()

  they 'rename a directory', (ssh) ->
    nikita
      ssh: ssh
    .system.copy
      source: "#{__dirname}/../resources/"
      target: "#{scratch}"
    .system.move
      source: "#{scratch}/a_dir"
      target: "#{scratch}/moved"
    , (err, {status}) ->
      status.should.be.true() unless err
    # The target file should exists
    .file.assert
      target: "#{scratch}/moved"
    # The source file should no longer exists
    .file.assert
      target: "#{scratch}/a_dir"
      not: true
    .promise()

  they 'overwrite a file', (ssh) ->
    nikita
      ssh: ssh
    .file [
      content: "hello"
      target: "#{scratch}/src1.txt"
    ,
      content: "hello"
      target: "#{scratch}/src2.txt"
    ,
      content: "overwritten"
      target: "#{scratch}/dest.txt"
    ]
    .system.move
      source: "#{scratch}/src1.txt"
      target: "#{scratch}/dest.txt"
    , (err, {status}) ->
      status.should.be.true() unless err
    .system.move # Move a file with the same content
      source: "#{scratch}/src2.txt"
      target: "#{scratch}/dest.txt"
    , (err, {status}) ->
      status.should.be.false() unless err
    .file.assert
      target: "#{scratch}/dest.txt"
      content: 'hello'
    .file.assert
      target: "#{scratch}/src2.txt"
      not: true
    .promise()

  they 'force bypass checksum comparison', (ssh) ->
    nikita
      ssh: ssh
    .file [
      content: "hello"
      target: "#{scratch}/src.txt"
    ,
      content: "hello"
      target: "#{scratch}/dest.txt"
    ]
    .system.move
      source: "#{scratch}/src.txt"
      target: "#{scratch}/dest.txt"
      force: 1
    , (err, {status}) ->
      status.should.be.true()
    .promise()
