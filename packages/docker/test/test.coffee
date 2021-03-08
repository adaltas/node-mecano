
fs = require 'fs'
# Write default configuration
if not process.env['NIKITA_TEST_MODULE'] and (
  not fs.existsSync("#{__dirname}/../test.js") and
  not fs.existsSync("#{__dirname}/../test.json") and
  not fs.existsSync("#{__dirname}/../test.coffee")
)
  config = fs.readFileSync "#{__dirname}/../test.sample.coffee"
  fs.writeFileSync "#{__dirname}/../test.coffee", config
# Read configuration
config = require process.env['NIKITA_TEST_MODULE'] or "../test.coffee"
# Export configuration
module.exports = config

# Cache images
return unless config.tags.docker
nikita = require '@nikitajs/core/lib'
they = require('mocha-they')(config.config)
they 'wait for docker daemon to listen', ({ssh}) ->
  # Note, this particularly apply to docker-compose environnements
  # where the daemon take some time to be up and running
  # Wait 5s before timeout
  nikita
    ssh: ssh
    docker: config.docker
  .execute.wait
    command: 'docker ps'
    retry: 20
    interval: 250
they 'cache image to avoid timeout later', ({ssh}) ->
  @timeout 0
  nikita
    ssh: ssh
    docker: config.docker
  .docker.pull image: 'httpd'
