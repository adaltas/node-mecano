
nikita = require '../../src'

describe 'action.handler', ->
  
  describe 'root action', ->
    
    it 'return an object', ->
      {key} = await nikita ->
        new Promise (resolve, reject) ->
          resolve key: 'value'
      key.should.eql 'value'
          
    it 'return an object', ->
      {key} = await nikita ->
        key: 'value'
      key.should.eql 'value'
      
  describe 'namespaced action', ->

    it 'return a promise', ->
      {key} = await nikita().call ->
        new Promise (resolve, reject) ->
          resolve key: 'value'
      key.should.eql 'value'

    it 'return an object', ->
      {key} = await nikita().call ->
        key: 'value'
      key.should.eql 'value'
      
  describe 'result', ->

    it 'return a user resolved promise', ->
      nikita.call
        handler: ({config}) ->
          new Promise (accept, reject) ->
            setImmediate -> accept output: 'ok'
      .should.be.resolvedWith output: 'ok', status: false

    it 'return an action resolved promise', ->
      nikita.call
        handler: ({config}) ->
          @call
            handler: ->
              new Promise (accept, reject) ->
                setImmediate -> accept output: 'ok'
      .should.be.resolvedWith output: 'ok', status: false
