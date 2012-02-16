
{EventEmitter} = require 'events'
assert = require 'assert'
mecano = require '../'

module.exports = 
    'exec # option # cmd': (next) ->
        mecano.exec
            cmd: 'text=yes; echo $text'
        , (err, executed, stdout, stderr) ->
            assert.eql stdout, 'yes\n'
            next()
    'exec # option # host': (next) ->
        mecano.exec
            host: 'localhost'
            cmd: 'text=yes; echo $text'
        , (err, executed, stdout, stderr) ->
            assert.eql stdout, 'yes\n'
            next()
    'exec # option # stdout': (next) ->
        evemit = new EventEmitter
        evemit.on 'data', (data) -> assert.eql stdout, 'yes\n'
        evemit.end = next
        mecano.exec
            host: 'localhost'
            cmd: 'text=yes; echo $text'
            stdout: evemit
        , (err, executed, stdout, stderr) ->
            assert.eql stdout, undefined
    'exec # option # if_exists': (next) ->
        mecano.exec
            cmd: 'text=yes; echo $text'
            if_exists: __dirname
        , (err, executed, stdout, stderr) ->
            assert.eql executed, 1
            assert.eql stdout, 'yes\n'
            mecano.exec
                cmd: 'text=yes; echo $text'
                if_exists: "__dirname/toto"
            , (err, executed, stdout, stderr) ->
                assert.eql executed, 0
                assert.eql stdout, undefined
                next()


