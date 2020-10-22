// Generated by CoffeeScript 2.5.1
// # `nikita.docker.compose`

// Create and start containers according to a docker-compose file
// `nikita.docker.compose` is an alias to `nikita.docker.compose.up`

// ## Callback parameters

// *   `err`   
//     Error object if any.   
// *   `executed`   
//     if command was executed   
// *   `stdout`   
//     Stdout value(s) unless `stdout` option is provided.   
// *   `stderr`   
//     Stderr value(s) unless `stderr` option is provided.   

// ## Schema
var docker, handler, path, schema;

schema = {
  type: 'object',
  properties: {
    'content': {
      type: 'object',
      description: `The content of the docker-compose.yml to write if not exist.`
    },
    'eof': {
      type: 'boolean',
      default: true,
      description: `Inherited from nikita.file use when writing docker-compose.yml file.`
    },
    'backup': {
      oneOf: [
        {
          type: 'string'
        },
        {
          type: 'boolean'
        }
      ],
      default: false,
      description: `Create a backup, append a provided string to the filename extension or a
timestamp if value is not a string, only apply if the target file exists and
is modified.`
    },
    'detached': {
      type: 'boolean',
      default: true,
      description: `Run Containers in detached mode. Default to true.`
    },
    'force': {
      type: 'boolean',
      default: false,
      description: `Force to re-create the containers if the config and image have not changed
Default to false`
    },
    'services': {
      oneOf: [
        {
          type: 'string'
        },
        {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      ],
      description: `Specify specific services to create.`
    },
    'target': {
      type: 'string',
      description: `The docker-compose.yml absolute's file's path, required if no content is 
specified.`
    }
  }
};

// ## Source Code
handler = async function({
    config,
    tools: {find, log}
  }) {
  var clean_target, containers, k, ref, status, stdout, v;
  log({
    message: "Entering Docker Compose",
    level: 'DEBUG',
    module: 'nikita/lib/docker/compose/up'
  });
  // Global config
  config.docker = (await find(function({
      config: {docker}
    }) {
    return docker;
  }));
  ref = config.docker;
  for (k in ref) {
    v = ref[k];
    if (config[k] == null) {
      config[k] = v;
    }
  }
  if ((config.target == null) && (config.content == null)) {
    // Validate parameters
    throw Error('Missing docker-compose content or target');
  }
  if (config.content && (config.target == null)) {
    if (config.target == null) {
      config.target = `/tmp/nikita_docker_compose_${Date.now()}/docker-compose.yml`;
    }
    clean_target = true;
  }
  if (config.recreate == null) {
    config.recreate = false; // TODO: move to schema
  }
  if (config.services == null) {
    config.services = [];
  }
  if (!Array.isArray(config.services)) {
    config.services = [config.services];
  }
  // services = config.services.join ' '
  this.file.yaml({
    if: config.content != null,
    eof: config.eof,
    backup: config.backup,
    target: config.target,
    content: config.content
  });
  ({status, stdout} = (await this.docker.tools.execute({
    cmd: `--file ${config.target} ps -q | xargs docker ${docker.opts(config)} inspect`,
    compose: true,
    cwd: config.cwd,
    uid: config.uid,
    code_skipped: 123,
    stdout_log: false,
    shy: true
  })));
  if (!status) {
    status = true;
  } else {
    containers = JSON.parse(stdout);
    status = containers.some(function(container) {
      return !container.State.Running;
    });
    if (status) {
      log("Docker created, need start");
    }
  }
  try {
    return (await this.docker.tools.execute({
      if: config.force || status,
      cmd: [`--file ${config.target} up`, config.detached ? '-d' : void 0, config.force ? '--force-recreate' : void 0, ...config.services].join(' '),
      compose: true,
      cwd: path.dirname(config.target),
      uid: config.uid
    }));
  } finally {
    this.fs.remove({
      if: clean_target,
      target: config.target
    });
  }
};

// ## Exports
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
docker = require('../utils');

path = require('path');
