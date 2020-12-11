
nikita = require 'nikita'

module.exports = ({params}) ->
  nikita
    metadata: debug: params.debug
  .log.cli pad: host: 20, header: 60
  .log.md basename: 'start', basedir: params.log, archive: false, if: params.log
  .execute
    cwd: "#{__dirname}/../../../assets"
    command: '''
    vagrant halt
    '''
