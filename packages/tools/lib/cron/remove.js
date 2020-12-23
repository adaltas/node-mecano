// Generated by CoffeeScript 2.5.1
// # `nikita.tools.cron.remove`

// Remove job(s) on crontab.

// ## Example

// ```js
// const {status} = await nikita.cron.remove({
//   command: 'kinit service/my.fqdn@MY.REALM -kt /etc/security/service.keytab',
//   when: '0 */9 * * *',
//   user: 'service'
// })
// console.info(`Cron entry was removed: ${status}`)
// ```

// ## Schema
var handler, schema, utils;

schema = {
  type: 'object',
  properties: {
    'command': {
      type: 'string',
      description: `The shell command of the job. By default all jobs will match.`
    },
    'user': {
      type: 'string',
      description: `The user of the crontab. The SSH user by default.`
    },
    'when': {
      type: 'string',
      description: `Cron-styled time string. Defines the frequency of the cron job. By
default all frequency will match.`
    }
  },
  required: ['command']
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var crontab, i, j, job, jobs, len, myjob, regex, status, stderr, stdout;
  if (config.user != null) {
    log({
      message: `Using user ${config.user}`,
      level: 'INFO',
      module: 'nikita/tools/lib/cron/remove'
    });
    crontab = `crontab -u ${config.user}`;
  } else {
    log({
      message: "Using default user",
      level: 'INFO',
      module: 'nikita/tools/lib/cron/remove'
    });
    crontab = "crontab";
  }
  status = false;
  jobs = [];
  ({stdout, stderr} = (await this.execute({
    command: `${crontab} -l`,
    metadata: {
      shy: true
    }
  })));
  if (/^no crontab for/.test(stderr)) {
    throw Error('User crontab not found');
  }
  myjob = config.when ? utils.regexp.escape(config.when) : '.*';
  myjob += utils.regexp.escape(` ${config.command}`);
  regex = new RegExp(myjob);
  jobs = stdout.trim().split('\n');
  for (i = j = 0, len = jobs.length; j < len; i = ++j) {
    job = jobs[i];
    if (!regex.test(job)) {
      continue;
    }
    log({
      message: `Job '${job}' matches. Removing from list`,
      level: 'WARN',
      module: 'nikita/tools/lib/cron/remove'
    });
    status = true;
    jobs.splice(i, 1);
  }
  log({
    message: "No Job matches. Skipping",
    level: 'INFO',
    module: 'nikita/tools/lib/cron/remove'
  });
  if (!status) {
    return;
  }
  return (await this.execute({
    command: `${crontab} - <<EOF
${jobs ? jobs.join('\n', '\nEOF') : 'EOF'}`
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};

// ## Dependencies
utils = require('../utils');
