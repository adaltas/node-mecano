
p = require 'path'
nikita = require '../../../src'
{tags, ssh} = require '../../test'
they = require('ssh2-they').configure ssh

return unless tags.posix

describe 'plugins.tools.path', ->

  they 'ssh defined in current action', ({ssh}) ->
    nikita
      ssh: ssh
    , ({tools: {path}, ssh}) ->
      path.join('this','is','a','dir').should.eql unless ssh
      then p.join 'this','is','a','dir'
      else p.posix.join 'this','is','a','dir'

  they 'defined in parent action', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      @call -> @call ({tools: {path}, ssh}) ->
        path.join('this','is','a','dir').should.eql unless ssh
        then p.join 'this','is','a','dir'
        else p.posix.join 'this','is','a','dir'

  they 'reinject posix and win32', ({ssh}) ->
    nikita
      ssh: ssh
    , ({tools: {path}}) ->
      path.win32.should.eql p.win32
      path.posix.should.eql p.posix

  
