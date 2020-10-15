
nikita = require '../../src'
session = require '../../src/session'

# Test the construction of the session namespace stored in state

describe 'session.hooks', ->

  describe 'nikita:session:register', ->
    
    it 'alter action - sync', ->
      nikita ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:register': ({action}, handler)->
              action.key = 'new value'
              handler
        context.registry.register ['an', 'action'],
          key: 'value'
          handler: (->)
        context.an.action ({config}) ->
          config.key.should.eql 'new value'

    it 'alter action - async', ->
      nikita ({context, plugins, registry}) ->
        plugins.register
          hooks:
            'nikita:session:register': ({action}, handler)->
              new Promise (resolve, reject) ->
                setImmediate ->
                  action.key = 'new value'
                  resolve handler
        context.registry.register ['an', 'action'],
          key: 'value'
          handler: (->)
        context.an.action ({config}) ->
          config.key.should.eql 'new value'
            
    it 'handler is undefined', ->
      nikita ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:register': ({action}, handler)->
              (handler is undefined).should.be.ok()
              handler
        context.registry.register ['an', 'action'], {}

  describe 'nikita:session:action', ->
    
    it 'alter action - async', ->
      nikita ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:action': (action, handler) ->
              new Promise (resolve, reject) ->
                setImmediate ->
                  resolve (action) ->
                    action.config.new_key = 'new value'
                    handler.call action.context, action
        context.registry.register ['an', 'action'],
          key: 'value'
          handler: ({config}) -> config
        context.an.action().should.be.finally.eql
          key: 'value'
          new_key: 'new value'
          status: false
            
    it 'error throw in current context', ->
      nikita ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:action': (action, handler) ->
              if action.metadata.namespace.join('.') is 'an.action'
              then throw Error 'Catch me'
              else handler
        context.registry.register ['an', 'action'],
          handler: -> throw Error 'You are not invited'
        context
        .an.action()
        .should.be.rejectedWith 'Catch me'
          
    it 'error thrown parent session', ->
      nikita ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:action': (action, handler) ->
              if action.metadata.namespace.join('.') is 'an.action'
              then throw Error 'Catch me'
              else handler
        context.registry.register ['an', 'action'],
          handler: -> throw Error 'You are not invited'
        context
        .an.action()
      .should.be.rejectedWith 'Catch me'
          
    it 'error promise in current context', ->
      nikita ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:action': (action, handler) ->
              new Promise (resolve, reject) ->
                if action.metadata.namespace.join('.') is 'an.action'
                then reject Error 'Catch me'
                else resolve handler
        context.registry.register ['an', 'action'],
          handler: -> throw Error 'You are not invited'
        context
        .an.action()
        .should.be.rejectedWith 'Catch me'
        
    it 'error promise in parent session', ->
      nikita ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:action': (action, handler) ->
              new Promise (resolve, reject) ->
                if action.metadata.namespace.join('.') is 'an.action'
                then reject Error 'Catch me'
                else resolve handler
        context.registry.register ['an', 'action'],
          handler: -> throw Error 'You are not invited'
        context
        .an.action()
      .should.be.rejectedWith 'Catch me'
      
    it 'plugin return a promise, ensure child is executed', ->
      session ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:action': (action, handler) ->
              await new Promise (resolve) -> setImmediate resolve
              handler
        @call name: 'parent', ->
          @call name: 'child', ->
            'ok'
      .should.be.resolvedWith 'ok'

  describe 'nikita:session:result', ->
    
    it 'is called before action and children resolved', ->
      called = false
      await session plugins: [
        ->
          hooks: 'nikita:session:result': ({action}, handler) ->
            await new Promise (resolved) ->
              called = true
              setImmediate resolved
            handler
      ], (->)
      called.should.be.true()

  describe 'nikita:session:resolved', ->
    
    it 'test', ->
      await nikita ({context, plugins, registry}) ->
        plugins.register
          'hooks':
            'nikita:session:resolved': (action, output) ->
              console.log 'ok'
        @call ->
          console.log 'child 1'
        @call ->
          console.log 'child 2'
      .call ->
        console.log 'child 3'
