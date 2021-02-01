// Generated by CoffeeScript 2.5.1
// # `nikita.system.limits`

// Control system limits for a user.

// ## Implementation strategy

// ### `nproc` and `nofile`

// There are two cases, depending on the specified value:

// 1. Integer value   
//   If an int value is specified, then nikita checks that the value is lesser than
//   the kernel limit. Please be aware that it is necessary but not sufficient to
//   guarantee that the user would be able to open session.
// 2. Boolean value
//   If a true value is specified, then nikita set it to 75% of the kernel limit.
//   This value is neither optimal nor able to guarantee that the user would be
//   able to open session, but that is the best nikita can automatically do.

// ### Other values

// Other values are not assessed by default. They must be integers.

// ## Ulimit

// Linux allows to limit the resources allocated to users or user groups via
// "/etc/security/limits.conf" and "/etc/security/limits.d/*.conf" files loaded by
// WFP (Plugable Authentication Module) at each logon. The user can then adapt the
// resources available to its needs via "ulimit".

// It is possible to define, for a number of resources (number of open files, file size,
// number of instantiated process, CPU time, etc.), a "soft" limit which can be
// increased by user, via "ulimit" until a maximum "hard" limit.
// The system does not exceed the value of the soft limit. If the user wants to push
// this limit, it will set a new soft limit with ulimit.
// The soft limit is always lower or equal to the hard limit.
// In general, the limits applied to a user override those applied to a group.

// ## Ulimit commands

// The "S" option to "ulimit" impact the effective limit ("soft" limit) and the "H"
// impact the "hard" limit (maximum value that can be defined by the user).

// | resource             |   soft     |   hard     |  unit   |
// |----------------------|------------|------------|---------|
// | core file size       | ulimit -Sc | ulimit -Hc | blocks  |
// | data seg size        | ulimit -Sd | ulimit -Hd | kbytes  |
// | scheduling priority  | ulimit -Se | ulimit -He |         |
// | file size            | ulimit -Sf | ulimit -Hf | blocks  |
// | max locked memory    | ulimit -Sl | ulimit -Hl | kbytes  |
// | pending signals      | ulimit -Si | ulimit -Hi |         |
// | max memory size      | ulimit -Sm | ulimit -Hm | kbytes  |
// | open files           | ulimit -Sn | ulimit -Hn |         |
// | pipe size            | ulimit -Sp | ulimit -Hp | bytes   |
// | POSIX message queues | ulimit -Sq | ulimit -Hq | bytes   |
// | real-time priority   | ulimit -Sr | ulimit -Hr |         |
// | stack size           | ulimit -Ss | ulimit -Hs | kbytes  |
// | cpu time             | ulimit -St | ulimit -Ht | seconds |
// | max user processes   | ulimit -Su | ulimit -Hu |         |
// | virtual memory       | ulimit -Sv | ulimit -Hv | kbytes  |
// | file locks           | ulimit -Sx | ulimit -Hx |         |

// Pass the option in flag-mode to get, and follows it with a value to set.

// ## Retrieve current information

// Number of sub-process for a process:

// ```bash
// pid=14986
// ls /proc/$pid/task | wc
// ps -L p $pid --no-headers | wc -l
// ```

// Number of sub-process for a user, the option "-L" show threads, possibly with
// LWP and NLWP columns:

// ```bash
// user=`whoami`
// ps -L -u $user --no-headers | wc -l
// ```

// ## Kernel Limits

// User limits cannot exceed kernel limits, so you need to configure kernel limits
// before user limits.

// ### Processes

// ```bash
// sysctl kernel.pid_max         # print kernel.pid_max = VALUE
// cat /proc/sys/kernel/pid_max  # print VALUE
// ```

// _Temporary change_: `echo 4194303 > /proc/sys/kernel/pid_max`

// _Permanent change_: `vi /etc/sysctl.conf # kernel.pid_max = 4194303`

// ### Open Files

// ```bash
// sysctl fs.file-max         # print fs.file-max = VALUE
// cat /proc/sys/fs/file-max  # print VALUE
// ```

// _Temporary change_: `echo 1631017 > /proc/sys/fs/file-max`

// _Permanent change_ : `vi /etc/sysctl.conf # fs.file-max = 1631017`

// ## Example

// Setting the number of open file descriptors to .75 of the maximum value for 
// all the users:

// ```js
// const {status} = await nikita.system.limits({
//   system: true,
//   nofile: true
// });
// console.log(`Limits modified: ${status}`);
// ```

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if limits configuration file has been modified.   

// ## Schema

// Refer to the [limits.conf(5)](https://linux.die.net/man/5/limits.conf) Linux man
// page for further information.
var handler, regexp, schema;

schema = {
  type: 'object',
  properties: {
    'as': {
      $ref: '#/definitions/limits',
      description: `Address space limit (KB).`
    },
    'core': {
      $ref: '#/definitions/limits',
      description: `Limits the core file size (KB).`
    },
    'cpu': {
      $ref: '#/definitions/limits',
      description: `CPU time limit (in seconds). When the process reaches the soft limit,
it receives a SIGXCPU every second. When it reaches the hard limit, it
receives SIGKILL.`
    },
    'data': {
      $ref: '#/definitions/limits',
      description: `Max data size (KB).`
    },
    'fsize': {
      $ref: '#/definitions/limits',
      description: `Maximum filesize (KB).`
    },
    'locks': {
      $ref: '#/definitions/limits',
      description: `Max number of file locks the user can hold.`
    },
    'maxlogins': {
      $ref: '#/definitions/limits',
      description: `Max number of logins for this user.`
    },
    'maxsyslogins': {
      $ref: '#/definitions/limits',
      description: `Max number of logins on the system.`
    },
    'memlock': {
      $ref: '#/definitions/limits',
      description: `Max locked-in-memory address space (KB).`
    },
    'msgqueue': {
      $ref: '#/definitions/limits',
      description: `Max memory used by POSIX message queues (bytes).`
    },
    'nice': {
      oneOf: [
        {
          type: 'integer',
          minimum: -20,
          maximum: 19
        },
        {
          type: 'object',
          patternProperties: {
            '^-|soft|hard$': {
              type: 'integer',
              minimum: -20,
              maximum: 19
            }
          },
          additionalProperties: false
        }
      ],
      description: `Max nice priority allowed to raise to values.`
    },
    'nofile': {
      $ref: '#/definitions/limits',
      description: `Max number of open file descriptors.`
    },
    'nproc': {
      $ref: '#/definitions/limits',
      description: `Max number of processes.`
    },
    'priority': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'object',
          patternProperties: {
            '^-|soft|hard$': {
              type: 'integer'
            }
          },
          additionalProperties: false
        }
      ],
      description: `Priority to run user process with.`
    },
    'rss': {
      $ref: '#/definitions/limits',
      description: `Max resident set size (KB).`
    },
    'sigpending': {
      $ref: '#/definitions/limits',
      description: `Max number of pending signals.`
    },
    'stack': {
      $ref: '#/definitions/limits',
      description: `Max stack size (KB).`
    },
    'rtprio': {
      $ref: '#/definitions/limits',
      description: `Max realtime priority..`
    },
    'system': {
      type: 'boolean',
      description: `Apply the limits at the system level.`
    },
    'target': {
      type: 'string',
      description: `Where to write the file, default to "/etc/security/limits.conf" for
system limits and "/etc/security/limits.d/#{config.user}.conf" for
user limits.`
    },
    'user': {
      type: 'string',
      description: `The username to who the limit apply, also used for the default target
name.`
    }
  },
  oneOf: [
    {
      required: ['system']
    },
    {
      required: ['user']
    }
  ],
  definitions: {
    'limits': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'boolean'
        },
        {
          type: 'object',
          patternProperties: {
            '^-|soft|hard$': {
              oneOf: [
                {
                  type: 'integer'
                },
                {
                  type: 'boolean'
                },
                {
                  type: 'string',
                  enum: ['unlimited']
                }
              ]
            }
          },
          additionalProperties: false
        },
        {
          type: 'string',
          enum: ['unlimited']
        }
      ]
    }
  }
};

// ## Handler
handler = async function({config}) {
  var _, i, j, k, kern_limit, len, len1, opt, ref, ref1, ref2, ref3, v, write;
  if (config.system && config.user) {
    throw Error(`Incoherent config: both system and user configuration are defined, ${JSON.stringify({
      system: config.system,
      user: config.user
    })}`);
  }
  if (config.system) {
    config.user = '*';
  }
  if (!config.user) {
    throw Error("Missing required option 'user'");
  }
  if (config.target == null) {
    config.target = "/etc/security/" + (config.user === '*' ? "limits.conf" : `limits.d/${config.user}.conf`);
  }
  // Calculate nofile from kernel limit
  if (config.nofile != null) {
    ({
      stdout: kern_limit
    } = (await this.execute({
      command: "cat /proc/sys/fs/file-max",
      // shy: true
      trim: true
    })));
    if (config.nofile === true) {
      config.nofile = Math.round(kern_limit * 0.75);
    } else if (typeof config.nofile === 'number') {
      if (config.nofile >= kern_limit) {
        throw Error(`Invalid nofile configuration property. Please set int value lesser than kernel limit: ${kern_limit}`);
      }
    } else if (typeof config.nofile === 'object') {
      ref = config.nofile;
      for (_ in ref) {
        v = ref[_];
        if (v >= kern_limit) {
          throw Error(`Invalid nofile configuration property. Please set int value lesser than kernel limit: ${kern_limit}`);
        }
      }
    }
  }
  // Calculate nproc from kernel limit
  if (config.nproc != null) {
    ({
      stdout: kern_limit
    } = (await this.execute({
      command: "cat /proc/sys/kernel/pid_max",
      shy: true,
      trim: true
    })));
    if (config.nproc === true) {
      config.nproc = Math.round(kern_limit * 0.75);
    } else if (typeof config.nproc === 'number') {
      if (config.nproc >= kern_limit) {
        throw Error(`Invalid nproc configuration property. Please set int value lesser than kernel limit: ${kern_limit}`);
      }
    } else if (typeof config.nproc === 'object') {
      ref1 = config.nproc;
      for (_ in ref1) {
        v = ref1[_];
        if (v >= kern_limit) {
          throw Error(`Invalid nproc configuration property. Please set int value lesser than kernel limit: ${kern_limit}`);
        }
      }
    }
  }
  // Config normalization
  write = [];
  ref2 = ['as', 'core', 'cpu', 'data', 'fsize', 'locks', 'maxlogins', 'maxsyslogins', 'memlock', 'msgqueue', 'nice', 'nofile', 'nproc', 'priority', 'rss', 'sigpending', 'stack', 'rtprio'];
  for (i = 0, len = ref2.length; i < len; i++) {
    opt = ref2[i];
    if (config[opt] == null) {
      continue;
    }
    if (typeof config[opt] !== 'object') {
      config[opt] = {
        '-': config[opt]
      };
    }
    ref3 = Object.keys(config[opt]);
    for (j = 0, len1 = ref3.length; j < len1; j++) {
      k = ref3[j];
      if (k !== 'soft' && k !== 'hard' && k !== '-') {
        throw Error(`Invalid option: ${JSON.stringify(config[opt])}`);
      }
      if (!((typeof config[opt][k] === 'number') || config[opt][k] === 'unlimited')) {
        throw Error(`Invalid option: ${config[opt][k]} not a number`);
      }
      write.push({
        match: RegExp(`^${regexp.escape(config.user)} +${regexp.escape(k)} +${opt}.+$`, 'm'),
        replace: `${config.user}    ${k}    ${opt}    ${config[opt][k]}`,
        append: true
      });
    }
  }
  if (!write.length) {
    return false;
  }
  return this.file({
    target: config.target,
    write: write,
    eof: true,
    uid: config.uid,
    gid: config.gid
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};

// ## Dependencies
({regexp} = require('./utils'));
