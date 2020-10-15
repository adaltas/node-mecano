
path = require 'path'
nikita = require '../../../src'
utils = require '../../../src/utils'
{tags, ssh} = require '../../test'
they = require('ssh2-they').configure ssh

describe 'actions.fs.mkdir', ->
  return unless tags.posix

  they 'argument', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.mkdir "#{tmpdir}/a_dir"
      {stats} = await @fs.base.stat "#{tmpdir}/a_dir"
      utils.stats.isDirectory(stats.mode).should.be.true()

  they 'status', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.mkdir "#{tmpdir}/a_dir"
      .should.be.resolvedWith status: true
      @fs.mkdir "#{tmpdir}/a_dir"
      .should.be.resolvedWith status: false
    
  they 'should create dir recursively', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.mkdir "#{tmpdir}/a_parent_dir/a_dir"
      .should.be.resolvedWith status: true
      {stats} = await @fs.base.stat "#{tmpdir}/a_parent_dir/a_dir"
      utils.stats.isDirectory(stats.mode).should.be.true()

  describe 'parent', ->

    they 'true set default system permissions', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.mkdir
          target: "#{tmpdir}/a_parent_dir/a_dir_2"
          parent: true
          mode: 0o717
        @fs.assert
          target: "#{tmpdir}/a_parent_dir"
          mode: 0o0717
          not: true

    they 'object set custom permissions', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.mkdir
          target: "#{tmpdir}/a_parent_dir/a_dir_1"
          parent: mode: 0o0741
          mode: 0o0715
        @fs.assert
          target: "#{tmpdir}/a_parent_dir"
          mode: 0o0741
        @fs.assert
          target: "#{tmpdir}/a_parent_dir/a_dir_1"
          mode: 0o0715

  describe 'exclude', ->

    they 'should stop when `exclude` match', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        source = "#{tmpdir}/a_parent_dir/a_dir/do_not_create_this"
        @fs.mkdir
          target: source
          exclude: /^do/
        .should.be.resolvedWith status: true
        @fs.assert
          target: source
          not: true
        @fs.assert
          target: path.dirname source

  describe 'cwd', ->

    they 'should honore `cwd` for relative paths', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.mkdir
          target: './a_dir'
          cwd: tmpdir
        .should.be.resolvedWith status: true
        @fs.assert
          target: "#{tmpdir}/a_dir"

  describe 'mode', ->

    they 'change mode as string', ({ssh}) ->
      # 40744: 4 for directory, 744 for permissions
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.mkdir
          target: "#{tmpdir}/ssh_dir_string"
          mode: '744'
        @fs.assert
          target: "#{tmpdir}/ssh_dir_string"
          mode: 0o0744

    they 'change mode as octal', ({ssh}) ->
      # 40744: 4 for directory, 744 for permissions
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.mkdir
          target: "#{tmpdir}/ssh_dir_string"
          mode: 0o744
        @fs.assert
          target: "#{tmpdir}/ssh_dir_string"
          mode: 0o0744

    they 'detect a permission change', ({ssh}) ->
      # 40744: 4 for directory, 744 for permissions
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.mkdir
          target: "#{tmpdir}/ssh_dir_string"
          mode: 0o744
        @fs.mkdir
          target: "#{tmpdir}/ssh_dir_string"
          mode: 0o755
        .should.be.resolvedWith status: true
        @fs.mkdir
          target: "#{tmpdir}/ssh_dir_string"
          mode: 0o755
        .should.be.resolvedWith status: false

    they 'dont ovewrite permission', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.mkdir
          target: "#{tmpdir}/a_dir"
          mode: 0o744
        @fs.mkdir
          target: "#{tmpdir}/a_dir"
        .should.be.resolvedWith status: false
        @fs.assert
          target: "#{tmpdir}/a_dir"
          mode: 0o0744

  describe 'error', ->

    they 'path must be absolute over ssh', ({ssh}) ->
      return unless ssh
      nikita
        ssh: ssh
      , ->
        @fs.mkdir
          target: "download_test"
        .should.be.rejectedWith
          code: 'NIKITA_MKDIR_TARGET_RELATIVE'
          message: [
            'NIKITA_MKDIR_TARGET_RELATIVE:'
            'only absolute path are supported over SSH,'
            'target is relative and config `cwd` is not provided,'
            'got "download_test"'
          ].join ' '

    they 'target exist but is not a directory', ({ssh}) ->
      nikita
        ssh: ssh
        tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.base.writeFile
          target: "#{tmpdir}/a_file"
          content: ''
        @fs.mkdir
          target: "#{tmpdir}/a_file"
        .should.be.rejectedWith
          code: 'NIKITA_MKDIR_TARGET_INVALID_TYPE'
          message: [
            'NIKITA_MKDIR_TARGET_INVALID_TYPE:',
            'target exists but it is not a directory,'
            'got "File" type'
          ].join ' '

describe 'system.mkdir options uid/gid', ->
  return unless tags.chown

  they 'change owner uid/gid on creation', ({ssh}) ->
    nikita
      ssh: ssh
      tmpdir: true
    , ({metadata: {tmpdir}}) ->
      await @execute """
      userdel 'toto'; groupdel 'toto'
      groupadd 'toto' -g 5678; useradd 'toto' -u 1234 -g 5678
      """
      @fs.mkdir
        target: "#{tmpdir}/ssh_dir_string"
        uid: 1234
        gid: 5678
      @fs.assert
        target: "#{tmpdir}/ssh_dir_string"
        uid: 1234
        gid: 5678
