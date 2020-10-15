
nikita = require '@nikitajs/engine/src'
{tags, ssh, db} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.db

describe 'db.schema.remove postgres', ->

  return unless db.postgresql

  they 'does not exists', ({ssh}) ->
    nikita
      ssh: ssh
      db: db.postgresql
    , ->
      @db.database.remove 'schema_remove_0'
      @db.database 'schema_remove_0'
      {status} = await @db.schema.remove
        config:
          schema: 'schema_remove_0'
          database: 'schema_remove_0'
      status.should.be.false()
      @db.database.remove 'schema_remove_0'

  they 'output exists', ({ssh}) ->
    nikita
      ssh: ssh
      db: db.postgresql
    , ->
      @db.database.remove 'schema_remove_1'
      @db.database 'schema_remove_1'
      @db.schema
        config:
          schema: 'schema_remove_1'
          database: 'schema_remove_1'
      {status} = await @db.schema.remove
        config:
          schema: 'schema_remove_1'
          database: 'schema_remove_1'
      status.should.be.true()
      {status} = await @db.schema.remove
        config:
          schema: 'schema_remove_1'
          database: 'schema_remove_1'
      status.should.be.false()
      @db.database.remove 'schema_remove_1'
