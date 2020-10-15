
fs = require 'fs'
nikita = require '../../src'
{tags, ssh} = require '../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

Writable = require('stream').Writable
class MyWritable extends Writable
  constructor: (data) ->
    super()
    @data = data
  _write: (chunk, encoding, callback) ->
    @data.push chunk.toString()
    callback()

describe 'action log.cli', ->

  describe 'handled event', ->
        
    they 'default options', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        stream: new MyWritable data
        time: false
      .call header: 'h1', ->
        @call header: 'h2a', ->
        @call header: 'h2b', ->
          @call header: 'h3', -> true
      # .wait 200
      .call ->
        data.should.eql [
          "#{host}   h1 : h2a   -\n"
          "#{host}   h1 : h2b : h3   ✔\n"
          "#{host}   h1 : h2b   ✔\n"
          "#{host}   h1   ✔\n"
        ]
    
    they 'pass over actions without header', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        stream: new MyWritable data
        time: false
      .call header: 'h1', ->
        @call header: 'h2a', ->
        @call  ->
          @call  ->
            @call header: 'h2b', -> true
      # .wait 200
      .call ->
        data.should.eql [
          "#{host}   h1 : h2a   -\n"
          "#{host}   h1 : h2b   ✔\n"
          "#{host}   h1   ✔\n"
        ]

    they 'status boolean', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        stream: new MyWritable data
        time: false
      .call header: 'a', -> false
      .call header: 'b', -> true
      .call ->
        data.should.eql [
          "#{host}   a   -\n"
          "#{host}   b   ✔\n"
        ]

    they 'status with shy', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        stream: new MyWritable data
        time: false
      .call header: 'a', shy: false, -> true
      .call header: 'b', shy: true, -> true
      .call ->
        data.should.eql [
          "#{host}   a   ✔\n"
          "#{host}   b   -\n"
        ]

    they.skip 'status with relax', ({ssh}) ->
      # TODO: see relax tests
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        stream: new MyWritable data
        time: false
      , ->
        try await @call header: 'b', relax: false, -> throw Error 'ok'
        catch err
        # @call header: 'b', relax: true, -> throw Error 'ok'
        @call ->
          console.log 'ok2', data
          data.should.eql [
            "#{host}   c   ✘\n"
            "#{host}   d   ✘\n"
          ]

    they 'bypass disabled', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        stream: new MyWritable data
        time: false
      .call header: 'a', -> true
      .call header: 'b', disabled: false, -> true
      .call header: 'c', disabled: true, -> true
      .call header: 'd', -> true
      .call ->
        data.should.eql [
          "#{host}   a   ✔\n"
          "#{host}   b   ✔\n"
          "#{host}   d   ✔\n"
        ]

    they 'bypass conditionnal', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        stream: new MyWritable data
        time: false
      .call header: 'a', -> true
      .call header: 'b', if: true, -> true
      .call header: 'c', if: false, -> true
      .call header: 'd', -> true
      .call ->
        data.should.eql [
          "#{host}   a   ✔\n"
          "#{host}   b   ✔\n"
          "#{host}   d   ✔\n"
        ]

    they 'option depth', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        depth_max: 2
        stream: new MyWritable data
        time: false
      .call header: 'h1', ->
        @call header: 'h2a', -> false
        @call header: 'h2b', ->
          @call header: 'h3', -> false
      .call ->
        data.should.eql [
          "#{host}   h1 : h2a   -\n"
          "#{host}   h1 : h2b   -\n"
          "#{host}   h1   -\n"
        ]

    they 'option divider', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        divider: ' # '
        stream: new MyWritable data
        time: false
      .call header: 'h1', ->
        @call header: 'h2a', ->
        @call header: 'h2b', ->
          @call header: 'h3', ->
      .call ->
        data.should.eql [
          "#{host}   h1 # h2a   -\n"
          "#{host}   h1 # h2b # h3   -\n"
          "#{host}   h1 # h2b   -\n"
          "#{host}   h1   -\n"
        ]

    they 'option pad', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: false
        pad: {host: 14, header: 18}
        stream: new MyWritable data
        time: false
      .call header: 'h1', ->
        @call header: 'h2a', ->
        @call header: 'h2b', ->
          @call header: 'h3', ->
      .call ->
        data.should.eql [
          "#{host}      h1 : h2a           -\n"
          "#{host}      h1 : h2b : h3      -\n"
          "#{host}      h1 : h2b           -\n"
          "#{host}      h1                 -\n"
        ]

    they 'option colors', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        colors: true
        stream: new MyWritable data
        time: false
      .call header: 'a', -> false
      .call header: 'b', -> true
      .call header: 'c', relax: true, -> throw Error 'ok'
      .call ->
        data.should.eql [
          "\u001b[36m\u001b[2m#{host}   a   -\u001b[22m\u001b[39m\n"
          "\u001b[32m#{host}   b   ✔\u001b[39m\n"
          "\u001b[31m#{host}   c   ✘\u001b[39m\n"
        ]
    
    they.skip 'option time', ({ssh}) ->
      # TODO: waiting for the time plugin
      data = []
      host = ssh?.config.host or 'localhost'
      nikita
        ssh: ssh
      .log.cli
        stream: new MyWritable data
        colors: false
      .call header: 'h1', (->)
      # .wait 200
      .call ->
        data[0].should.match /#{host}   h1   -  \dms\n/

  describe 'session events', ->
          
    they 'when resolved', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      await nikita
        ssh: ssh
      , ->
        @log.cli
          colors: false
          stream: new MyWritable data
          time: false
        @call header: 'h1', -> true
      data.should.eql [
        "#{host}   h1   ✔\n"
        "#{host}      ♥\n"
      ]
              
    they 'when rejected', ({ssh}) ->
      data = []
      host = ssh?.config.host or 'localhost'
      try
        await nikita
          ssh: ssh
        , ->
          @log.cli
            colors: false
            stream: new MyWritable data
            time: false
          @call header: 'h1', -> throw Error 'OK'
      catch err
      data.should.eql [
        "#{host}   h1   ✘\n"
        "#{host}      ✘\n"
      ]
