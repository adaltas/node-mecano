
nikita = require '../../../src'
registry = require '../../../src/registry'
register = require '../../../src/register'
{tags} = require '../../test'

return unless tags.api

describe 'plugins.metadata.position', ->

  it 'start at 0', ->
    nikita ({metadata}) ->
      metadata.position.should.eql [0]

  it 'are concatenated', ->
    nikita
    .call ({metadata}) ->
      metadata.position.should.eql [0, 0]

  it 'are incremented', ->
    nikita
    .call -> true
    .call ({metadata}) ->
      metadata.position.should.eql [0, 1]
      @call ({metadata}) ->
        metadata.position.should.eql [0, 1, 0]
      @call ({metadata}) ->
        metadata.position.should.eql [0, 1, 1]
