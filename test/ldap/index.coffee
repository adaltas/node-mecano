
nikita = require '../../src'
test = require '../test'

describe 'ldap.index', ->

  scratch = test.scratch @
  config = test.config()
  return if config.disable_ldap_index
  client = olcDbIndex = null
  beforeEach (next) ->
    client = ldap.createClient url: config.ldap.url
    client.bind config.ldap.binddn, config.ldap.passwd, (err) ->
      return next err if err
      client.search 'olcDatabase={2}bdb,cn=config',
        scope: 'base'
        attributes:['olcDbIndex']
      , (err, search) ->
        search.on 'searchEntry', (entry) ->
          olcDbIndex = entry.object.olcDbIndex
        search.on 'end', ->
          next()
  afterEach (next) ->
    change = new ldap.Change
      operation: 'replace'
      modification: olcDbIndex: olcDbIndex
    client.modify 'olcDatabase={2}bdb,cn=config', change, (err) ->
      client.unbind (err) ->
        next err

  it 'create a new index', ->
    nikita
      ldap: client
    .ldap.index
      name: 'olcDatabase={2}bdb,cn=config'
      indexes:
        aliasedEntryName: 'eq'
    , (err, {status}) ->
      status.should.be.true()
    .ldap.index
      name: 'olcDatabase={2}bdb,cn=config'
      indexes:
        aliasedEntryName: 'eq'
    , (err, {status}) ->
      status.should.be.false()
    .promise()

  it 'update an existing index', ->
    nikita
      ldap: client
    .ldap.index
      name: 'olcDatabase={2}bdb,cn=config'
      indexes:
        aliasedEntryName: 'eq'
    , (err, {status}) ->
      status.should.be.true()
    .ldap.index
      ldap: client
      name: 'olcDatabase={2}bdb,cn=config'
      indexes:
        aliasedEntryName: 'pres,eq'
    , (err, {status}) ->
      status.should.be.false()
    .ldap.index
      ldap: client
      name: 'olcDatabase={2}bdb,cn=config'
      indexes:
        aliasedEntryName: 'pres,eq'
    , (err, {status}) ->
      status.should.be.true()
    .promise()
