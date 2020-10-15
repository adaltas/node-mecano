
nikita = require '@nikitajs/engine/src'
utils = require '../src/utils'
{tags, ssh, tmpdir} = require '../test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'file.ini option stringify_single_key', ->
  
  # TODO: move to `utils.ini` tests

  they 'stringify write only key on props', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      {status} = await @file.ini
        content:
          'user':
            'name': 'toto'
            '--hasACar': ''
        target: "#{tmpdir}/user.ini"
        merge: false
        stringify: utils.ini.stringify_single_key
      status.should.be.true()
      @fs.assert
        target: "#{tmpdir}/user.ini"
        content: '[user]\nname = toto\n--hasACar\n'

  they 'merge ini containing single key lines', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = node\ncolor\n'
      {status} = await @file.ini
        content: user: preference: {language: 'c++', color: ''}
        stringify: utils.ini.stringify_single_key
        target: "#{tmpdir}/user.ini"
        merge: false
      status.should.be.true()
      @fs.assert
        target: "#{tmpdir}/user.ini"
        content: '[user.preference]\nlanguage = c++\ncolor\n'
