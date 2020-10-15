
nikita = require '@nikitajs/engine/src'
{tags, ssh, db} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.db

describe 'db.schema.exists postgres', ->

  return unless db.postgresql

  they 'output exists', ({ssh}) ->
    nikita
      ssh: ssh
      db: db.postgresql
    , ->
      @db.database.remove 'schema_exists_0'
      @db.database 'schema_exists_0'
      {exists} = await @db.schema.exists
        config:
          schema: 'schema_exists_0'
          database: 'schema_exists_0'
      exists.should.be.false()
      await @db.schema
        config:
          schema: 'schema_exists_0'
          database: 'schema_exists_0'
      {exists} = await @db.schema.exists
        config:
          schema: 'schema_exists_0'
          database: 'schema_exists_0'
      exists.should.be.true()
      @db.database.remove 'schema_exists_0'
