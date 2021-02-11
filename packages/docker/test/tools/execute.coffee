
nikita = require '@nikitajs/core/lib'
{tags, config, docker} = require '../test'
they = require('mocha-they')(config)

return unless tags.docker

describe 'docker.tools.execute', ->
  
  describe 'schema', ->

    it 'valid', ->
      nikita
      .docker.tools.execute
        command: 'ok'
        dry: true

    it 'command is required', ->
      nikita
      .docker.tools.execute()
      .should.be.rejectedWith [
        'NIKITA_SCHEMA_VALIDATION_CONFIG:'
        'one error was found in the configuration of action `docker.tools.execute`:'
        '#/required config should have required property \'command\'.'
      ].join ' '

    it 'machine is validated', ->
      nikita
      .docker.tools.execute
        command: 'ok'
        machine: '_'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: /#\/properties\/docker\/properties\/machine\/format config\/machine should match format "hostname"/

    it 'no additionnal properties', ->
      nikita
      .docker.tools.execute
        invalid: 'property'
        command: 'ok'
      .should.be.rejectedWith /should NOT have additional properties/
