
fs = require 'fs'
path = require 'path'
fs.exists ?= path.exists
mecano = require '../../src'
test = require '../test'
they = require 'ssh2-they'

describe 'chmod', ->

  scratch = test.scratch @

  they 'change a permission of a file', (ssh, next) ->
    mecano
      ssh: ssh
    .touch
      destination: "#{scratch}/a_file"
      mode: 0o0754
    .chmod
      destination: "#{scratch}/a_file"
      mode: 0o0744
    , (err, status) ->
      status.should.be.true() unless err
    .chmod
      destination: "#{scratch}/a_file"
      mode: 0o0744
    , (err, status) ->
      status.should.be.false() unless err
    .then next
