
fs = require 'fs'
mecano = require '../../src'
test = require '../test'
they = require 'ssh2-they'
fs = require 'ssh2-fs'

describe 'link', ->

  scratch = test.scratch @

  they 'should link file', (ssh, next) ->
    # Create a non existing link
    destination = "#{scratch}/link_test"
    mecano
      ssh: ssh
    .link # Link does not exist
      source: __filename
      destination: destination
    , (err, linked) ->
      linked.should.be.true()
    .link # Link already exists
      source: __filename
      destination: destination
    , (err, linked) ->
      linked.should.be.false()
    .then (err) ->
      return next err if err
      fs.lstat ssh, destination, (err, stat) ->
        stat.isSymbolicLink().should.be.true()
        next()
  
  they 'should link dir', (ssh, next) ->
    # Create a non existing link
    destination = "#{scratch}/link_test"
    mecano
      ssh: ssh
    .link # Link does not exist
      source: __dirname
      destination: destination
    , (err, linked) ->
      linked.should.be.true()
    .link # Link already exists
      ssh: ssh
      source: __dirname
      destination: destination
    , (err, linked) ->
      linked.should.be.false()
    .then (err) ->
      return next err if err
      fs.lstat ssh, destination, (err, stat) ->
        stat.isSymbolicLink().should.be.true()
        next()
  
  they 'should create parent directories', (ssh, next) ->
    # Create a non existing link
    mecano.link
      ssh: ssh
      source: __dirname
      destination: "#{scratch}/test/dir/link_test"
    , (err, linked) ->
      return next err if err
      linked.should.be.true()
      fs.lstat ssh, "#{scratch}/test/dir/link_test", (err, stat) ->
        stat.isSymbolicLink().should.be.true()
        # Test creating two identical parent dirs
        destination = "#{scratch}/test/dir2"
        mecano.link [
          ssh: ssh
          source: "#{__dirname}/merge.coffee"
          destination: "#{destination}/merge.coffee"
        ,
          ssh: ssh
          source: "#{__dirname}/mkdir.coffee"
          destination: "#{destination}/mkdir.coffee"
        ], (err, linked) ->
          return next err if err
          linked.should.be.true()
        .then next

  they 'should override invalid link', (ssh, next) ->
    mecano
      ssh: ssh
    .write
      destination: "#{scratch}/test/invalid_file"
      content: 'error'
    .write
      destination: "#{scratch}/test/valid_file"
      content: 'ok'
    .link
      source: "#{scratch}/test/invalid_file"
      destination: "#{scratch}/test/file_link"
    , (err, linked) ->
      linked.should.be.true() unless err
    .remove
      destination: "#{scratch}/test/invalid_file"
    .link
      source: "#{scratch}/test/valid_file"
      destination: "#{scratch}/test/file_link"
    , (err, linked) ->
      linked.should.be.true() unless err
    .then next

  describe 'error', ->

    they 'for invalid arguments', (ssh, next) ->
      # Test missing source
      mecano
        ssh: ssh
      .link
        destination: __filename
      .then (err, changed) ->
        err.message.should.eql "Missing source, got undefined"
      .link # Test missing destination
        source: __filename
      .then (err, linked) ->
        err.message.should.eql "Missing destination, got undefined"
      .then next
