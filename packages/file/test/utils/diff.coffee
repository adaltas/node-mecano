
nikita = require '@nikitajs/engine/src'
{tags, ssh, tmpdir} = require '../test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'file options diff', ->

  they 'type is a function', ({ssh}) ->
    diffcalled = false
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @file
        target: "#{tmpdir}/file"
        content: 'Testing diff\noriginal text'
      @file
        target: "#{tmpdir}/file"
        content: 'Testing diff\nnew text'
        diff: (text, diff) ->
          diffcalled = true
          diff.should.eql [
            { value: 'Testing diff\n', count: 1 }
            { value: 'original text', count: 1, added: undefined, removed: true }
            { value: 'new text', count: 1, added: true, removed: undefined }
          ]
      .should.be.resolvedWith status: true

  they 'emit logs', ({ssh}) ->
    # Prepare by creating a file with content
    logs = []
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}, operations: {events}}) ->
      events.on 'diff', (log) -> logs.push log.message
      @file
        target: "#{tmpdir}/file"
        content: 'Testing diff\noriginal text'
      @file
        target: "#{tmpdir}/file"
        content: 'Testing diff\nnew text'
      @call ->
        logs.should.eql [
          '1 + Testing diff\n2 + original text\n'
          '2 - original text\n2 + new text\n'
        ]

  they 'write a buffer', ({ssh}) ->
    # Passing a buffer as content resulted to a diff error
    # with message "#{content} has no method 'split'",
    # make sure this is fixed for ever
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}, operations: {events}}) ->
      diffs = []
      events.on 'diff', (log) ->
        # logs.push log.message
        diffs.push log.message
      @file
        target: "#{tmpdir}/file"
        content: Buffer.from 'ABC'
      @call ->
        diffs.should.eql [ '1 + ABC\n' ]

  they 'empty source on empty file', ({ssh}) ->
    logs = []
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}, operations: {events}}) ->
      events.on 'diff', (log) ->
        logs.push log.message
      await @file
        target: "#{tmpdir}/file"
        content: ''
      await @file
        target: "#{tmpdir}/file"
        content: ''
      logs.should.eql ['']

  they 'content on created file', ({ssh}) ->
    diff = null
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      await @file
        target: "#{tmpdir}/file"
        content: 'some content'
        diff: (text, raw) -> diff = text
      diff.should.eql '1 + some content\n'
