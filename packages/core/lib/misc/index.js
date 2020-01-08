// Generated by CoffeeScript 2.4.1
var Stream, array, docker, each, exec, fs, ini, merge, misc, path, ssh, string, tilde, util,
  splice = [].splice;

fs = require('fs');

path = require('path');

each = require('each');

({merge} = require('mixme'));

util = require('util');

Stream = require('stream');

exec = require('ssh2-exec');

ini = require('./ini');

tilde = require('tilde-expansion');

string = require('./string');

array = require('./array');

docker = require('./docker');

ssh = require('./ssh');

misc = module.exports = {
  docker: require('./docker'),
  stats: require('./stats'),
  ssh: require('./ssh'),
  // TODO: to move
  regexp: {
    // Escape RegExp related charracteres
    // eg `///^\*/\w+@#{misc.regexp.escape realm}\s+\*///mg`
    escape: function(str) {
      return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    is: function(reg) {
      return reg instanceof RegExp;
    }
  },
  object: {
    equals: function(obj1, obj2, keys) {
      var j, k, keys1, keys2, len;
      keys1 = Object.keys(obj1);
      keys2 = Object.keys(obj2);
      if (keys) {
        keys1 = keys1.filter(function(k) {
          return keys.indexOf(k) !== -1;
        });
        keys2 = keys2.filter(function(k) {
          return keys.indexOf(k) !== -1;
        });
      } else {
        keys = keys1;
      }
      if (keys1.length !== keys2.length) {
        return false;
      }
      for (j = 0, len = keys.length; j < len; j++) {
        k = keys[j];
        if (obj1[k] !== obj2[k]) {
          return false;
        }
      }
      return true;
    },
    diff: function(obj1, obj2, keys) {
      var diff, k, keys1, keys2, v;
      if (!keys) {
        keys1 = Object.keys(obj1);
        keys2 = Object.keys(obj2);
        keys = array.merge(keys1, keys2, array.unique(keys1));
      }
      diff = {};
      for (k in obj1) {
        v = obj1[k];
        if (!(keys.indexOf(k) >= 0)) {
          continue;
        }
        if (obj2[k] === v) {
          continue;
        }
        diff[k] = [];
        diff[k][0] = v;
      }
      for (k in obj2) {
        v = obj2[k];
        if (!(keys.indexOf(k) >= 0)) {
          continue;
        }
        if (obj1[k] === v) {
          continue;
        }
        if (diff[k] == null) {
          diff[k] = [];
        }
        diff[k][1] = v;
      }
      return diff;
    },
    clone: function(obj) {
      return merge({}, obj);
    }
  },
  path: {
    normalize: function(location, callback) {
      return tilde(location, function(location) {
        return callback(path.normalize(location));
      });
    },
    resolve: function(...locations) {
      var callback, normalized, ref1;
      ref1 = locations, [...locations] = ref1, [callback] = splice.call(locations, -1);
      normalized = [];
      each(locations).call(function(location, next) {
        return misc.path.normalize(location, function(location) {
          normalized.push(location);
          return next();
        });
      }).next(function() {
        return callback(path.resolve(...normalized));
      });
      return null;
    }
  },
  mode: {
    stringify: function(mode) {
      if (typeof mode === 'number') {
        return mode.toString(8);
      } else {
        return mode;
      }
    },
    /*
    Compare multiple mode. All arguments modes must match. If first mode is any array, then
    other arguments mode must much at least one element of the array.
    */
    compare: function(...modes) {
      var i, j, mode, ref, ref1;
      ref = modes[0];
      if (ref == null) {
        throw Error(`Invalid mode: ${ref}`);
      }
      if (!Array.isArray(ref)) {
        ref = [ref];
      }
      ref = ref.map(function(mode) {
        return misc.mode.stringify(mode);
      });
      for (i = j = 1, ref1 = modes.length; (1 <= ref1 ? j < ref1 : j > ref1); i = 1 <= ref1 ? ++j : --j) {
        mode = misc.mode.stringify(modes[i]);
        if (!ref.some(function(m) {
          var l;
          l = Math.min(m.length, mode.length);
          return m.substr(-l) === mode.substr(-l);
        })) {
          return false;
        }
      }
      return true;
    }
  },
  /*
  `isPortOpen(port, host, callback)`: Check if a port is already open

  */
  isPortOpen: function(port, host, callback) {
    if (arguments.length === 2) {
      callback = host;
      host = '127.0.0.1';
    }
    return exec(`nc ${host} ${port} < /dev/null`, function(err, stdout, stderr) {
      if (!err) {
        return callback(null, true);
      }
      if (err.code === 1) {
        return callback(null, false);
      }
      return callback(err);
    });
  },
  /*
  `merge([inverse], obj1, obj2, ...]`: Recursively merge objects
  --------------------------------------------------------------
  On matching keys, the last object take precedence over previous ones
  unless the inverse arguments is provided as true. Only objects are
  merge, arrays are overwritten.

  Enrich an existing object with a second one:
    obj1 = { a_key: 'a value', b_key: 'b value'}
    obj2 = { b_key: 'new b value'}
    result = misc.merge obj1, obj2
    assert.eql result, obj1
    assert.eql obj1.b_key, 'new b value'

  Create a new object from two objects:
    obj1 = { a_key: 'a value', b_key: 'b value'}
    obj2 = { b_key: 'new b value'}
    result = misc.merge {}, obj1, obj2
    assert.eql result.b_key, 'new b value'

  Using inverse:
    obj1 = { b_key: 'b value'}
    obj2 = { a_key: 'a value', b_key: 'new b value'}
    misc.merge true, obj1, obj2
    assert.eql obj1.a_key, 'a value'
    assert.eql obj1.b_key, 'b value'

  */
  merge: function() {
    var clone, copy, from, i, inverse, j, name, options, ref1, ref2, src, target, to;
    console.warn('Function merge is deprecated, use mixme instead');
    target = arguments[0];
    from = 1;
    to = arguments.length;
    if (typeof target === 'boolean') {
      inverse = !!target;
      target = arguments[1];
      from = 2;
    }
    if (target == null) {
      target = {};
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && typeof target !== 'function') {
      target = {};
    }
    for (i = j = ref1 = from, ref2 = to; (ref1 <= ref2 ? j < ref2 : j > ref2); i = ref1 <= ref2 ? ++j : --j) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) !== null) {
// Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];
          if (target === copy) {
            // Prevent never-ending loop
            continue;
          }
          // Recurse if we're merging plain objects
          if ((copy != null) && typeof copy === 'object' && !Array.isArray(copy) && !(copy instanceof RegExp) && !Buffer.isBuffer(copy)) {
            clone = src && (src && typeof src === 'object' ? src : {});
            // Never move original objects, clone them
            target[name] = misc.merge(false, clone, copy);
          // Don't bring in undefined values
          } else if (copy !== void 0) {
            if (Array.isArray(copy)) {
              copy = copy.slice(0);
            }
            if (!(inverse && typeof target[name] !== 'undefined')) {
              target[name] = copy;
            }
          }
        }
      }
    }
    // Return the modified object
    return target;
  },
  kadmin: function(options, cmd) {
    var realm;
    realm = options.realm ? `-r ${options.realm}` : '';
    if (options.kadmin_principal) {
      return `kadmin ${realm} -p ${options.kadmin_principal} -s ${options.kadmin_server} -w ${options.kadmin_password} -q '${cmd}'`;
    } else {
      return `kadmin.local ${realm} -q '${cmd}'`;
    }
  },
  yaml: {
    merge: function(original, new_obj, undefinedOnly) {
      var k, v;
      for (k in original) {
        v = original[k];
        if (v && typeof v === 'object' && typeof new_obj[k] !== 'undefined') {
          new_obj[k] = misc.yaml.merge(v, new_obj[k], undefinedOnly);
          continue;
        }
        if (typeof new_obj[k] === 'undefined') {
          new_obj[k] = v;
        }
      }
      return new_obj;
    },
    clean: function(original, new_obj, undefinedOnly) {
      var k, v;
      for (k in original) {
        v = original[k];
        if (v && typeof v === 'object' && new_obj[k]) {
          original[k] = misc.yaml.clean(v, new_obj[k], undefinedOnly);
          continue;
        }
        if (new_obj[k] === null) {
          delete original[k];
        }
      }
      return original;
    }
  },
  ini: ini,
  cgconfig: {
    parse: function(str) {
      var current_controller_name, current_default, current_group, current_group_controller, current_group_name, current_group_perm, current_group_perm_content, current_group_section, current_group_section_perm_name, current_mount, current_mount_section, lines, list_of_group_sections, list_of_mount_sections;
      lines = string.lines(str);
      list_of_mount_sections = [];
      list_of_group_sections = {};
      // variable which hold the cursor position
      current_mount = false;
      current_group = false;
      current_group_name = '';
      current_group_controller = false;
      current_group_perm = false;
      current_group_perm_content = false;
      current_default = false;
      // variables which hold the data
      current_mount_section = null;
      current_group_section = null; // group section is a tree but only of group
      current_controller_name = null;
      current_group_section_perm_name = null;
      lines.forEach(function(line, _, __) {
        var base, base1, match, match_admin, name, name1, name2, name3, name4, sep, type, value;
        if (!line || line.match(/^\s*$/)) {
          return;
        }
        if (!current_mount && !current_group && !current_default) {
          if (/^mount\s{$/.test(line)) { // start of a mount object
            current_mount = true;
            current_mount_section = [];
          }
          if (/^(group)\s([A-z|0-9|\/]*)\s{$/.test(line)) { // start of a group object
            current_group = true;
            match = /^(group)\s([A-z|0-9|\/]*)\s{$/.exec(line);
            current_group_name = match[2];
            current_group_section = {};
            if (list_of_group_sections[name1 = `${current_group_name}`] == null) {
              list_of_group_sections[name1] = {};
            }
          }
          if (/^(default)\s{$/.test(line)) { // start of a special group object named default
            current_group = true;
            current_group_name = '';
            current_group_section = {};
            return list_of_group_sections[name2 = `${current_group_name}`] != null ? list_of_group_sections[name2] : list_of_group_sections[name2] = {};
          }
        } else {
          // we are parsing a mount object
          // ^(cpuset|cpu|cpuacct|memory|devices|freezer|net_cls|blkio)\s=\s[aA-zZ|\s]*
          if (current_mount) {
            if (/^}$/.test(line)) { // close the mount object
              list_of_mount_sections.push(...current_mount_section);
              current_mount = false;
              current_mount_section = [];
            } else {
              // add the line to mont object
              line = line.replace(';', '');
              sep = '=';
              if (line.indexOf(':') !== -1) {
                sep = ':';
              }
              line = line.split(sep);
              current_mount_section.push({
                type: `${line[0].trim()}`,
                path: `${line[1].trim()}`
              });
            }
          }
          // we are parsing a group object
          // ^(cpuset|cpu|cpuacct|memory|devices|freezer|net_cls|blkio)\s=\s[aA-zZ|\s]*
          if (current_group) {
            // if a closing bracket is encountered, it should set the cursor to false
            if (/^(\s*)?}$/.test(line)) {
              if (current_group) {
                if (current_group_controller) {
                  return current_group_controller = false;
                } else if (current_group_perm) {
                  if (current_group_perm_content) {
                    return current_group_perm_content = false;
                  } else {
                    return current_group_perm = false;
                  }
                } else {
                  current_group = false;
                  // push the group if the closing bracket is closing a group
                  // list_of_group_sections["#{current_group_name}"] = current_group_section
                  return current_group_section = null;
                }
              }
            } else {
              //closing the group object
              match = /^\s*(cpuset|cpu|cpuacct|memory|devices|freezer|net_cls|blkio)\s{$/.exec(line);
              if (!current_group_perm && !current_group_controller) {
                //if neither working in perm or controller section, we are declaring one of them
                if (/^\s*perm\s{$/.test(line)) { // perm declaration
                  current_group_perm = true;
                  current_group_section['perm'] = {};
                  list_of_group_sections[`${current_group_name}`]['perm'] = {};
                }
                if (match) { //controller declaration
                  current_group_controller = true;
                  current_controller_name = match[1];
                  current_group_section[`${current_controller_name}`] = {};
                  return (base = list_of_group_sections[`${current_group_name}`])[name3 = `${current_controller_name}`] != null ? base[name3] : base[name3] = {};
                }
              } else if (current_group_perm && current_group_perm_content) { // perm config
                line = line.replace(';', '');
                line = line.split('=');
                [type, value] = line;
                current_group_section['perm'][current_group_section_perm_name][type.trim()] = value.trim();
                return list_of_group_sections[`${current_group_name}`]['perm'][current_group_section_perm_name][type.trim()] = value.trim();
              } else if (current_group_controller) { // controller config
                line = line.replace(';', '');
                sep = '=';
                if (line.indexOf(':') !== -1) {
                  sep = ':';
                }
                line = line.split(sep);
                [type, value] = line;
                return (base1 = list_of_group_sections[`${current_group_name}`][`${current_controller_name}`])[name4 = type.trim()] != null ? base1[name4] : base1[name4] = value.trim();
              } else {
                match_admin = /^\s*(admin|task)\s{$/.exec(line);
                if (match_admin) { // admin or task declaration
                  [_, name] = match_admin; //the name is either admin or task
                  current_group_perm_content = true;
                  current_group_section_perm_name = name;
                  current_group_section['perm'][name] = {};
                  return list_of_group_sections[`${current_group_name}`]['perm'][name] = {};
                }
              }
            }
          }
        }
      });
      return {
        mounts: list_of_mount_sections,
        groups: list_of_group_sections
      };
    },
    stringify: function(obj, options = {}) {
      var count, group, group_render, i, indent, j, k, key, len, mount, mount_render, n, name, prop, ref1, ref2, ref3, ref4, ref5, render, sections, val, value;
      if (obj.mounts == null) {
        obj.mounts = [];
      }
      if (obj.groups == null) {
        obj.groups = {};
      }
      render = "";
      if (options.indent == null) {
        options.indent = 2;
      }
      indent = '';
      for (i = j = 1, ref1 = options.indent; (1 <= ref1 ? j <= ref1 : j >= ref1); i = 1 <= ref1 ? ++j : --j) {
        indent += ' ';
      }
      sections = [];
      if (obj.mounts.length !== 0) {
        mount_render = "mount {\n";
        ref2 = obj.mounts;
        for (k = n = 0, len = ref2.length; n < len; k = ++n) {
          mount = ref2[k];
          mount_render += `${indent}${mount.type} = ${mount.path};\n`;
        }
        mount_render += '}';
        sections.push(mount_render);
      }
      count = 0;
      ref3 = obj.groups;
      for (name in ref3) {
        group = ref3[name];
        group_render = (name === '') || (name === 'default') ? 'default {\n' : `group ${name} {\n`;
        for (key in group) {
          value = group[key];
          if (key === 'perm') {
            group_render += `${indent}perm {\n`;
            if (value['admin'] != null) {
              group_render += `${indent}${indent}admin {\n`;
              ref4 = value['admin'];
              for (prop in ref4) {
                val = ref4[prop];
                group_render += `${indent}${indent}${indent}${prop} = ${val};\n`;
              }
              group_render += `${indent}${indent}}\n`;
            }
            if (value['task'] != null) {
              group_render += `${indent}${indent}task {\n`;
              ref5 = value['task'];
              for (prop in ref5) {
                val = ref5[prop];
                group_render += `${indent}${indent}${indent}${prop} = ${val};\n`;
              }
              group_render += `${indent}${indent}}\n`;
            }
            group_render += `${indent}}\n`;
          } else {
            group_render += `${indent}${key} {\n`;
            for (prop in value) {
              val = value[prop];
              group_render += `${indent}${indent}${prop} = ${val};\n`;
            }
            group_render += `${indent}}\n`;
          }
        }
        group_render += '}';
        count++;
        sections.push(group_render);
      }
      return sections.join("\n");
    }
  },
  // parse the content of tmpfs daemon configuration file
  tmpfs: {
    parse: function(str) {
      var files, lines;
      lines = string.lines(str);
      files = {};
      lines.forEach(function(line, _, __) {
        var age, argu, gid, i, key, mode, mount, obj, ref1, results, type, uid, values;
        if (!line || line.match(/^#.*$/)) {
          return;
        }
        values = [type, mount, mode, uid, gid, age, argu] = line.split(/\s+/);
        obj = {};
        ref1 = ['type', 'mount', 'perm', 'uid', 'gid', 'age', 'argu'];
        results = [];
        for (i in ref1) {
          key = ref1[i];
          obj[key] = values[i] !== void 0 ? values[i] : '-';
          if (i === `${values.length - 1}`) {
            if (obj['mount'] != null) {
              results.push(files[mount] = obj);
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
      return files;
    },
    stringify: function(obj) {
      var i, k, key, lines, ref1, v;
      lines = [];
      for (k in obj) {
        v = obj[k];
        ref1 = ['mount', 'perm', 'uid', 'gid', 'age', 'argu'];
        for (i in ref1) {
          key = ref1[i];
          v[key] = v[key] !== void 0 ? v[key] : '-';
        }
        lines.push(`${v.type} ${v.mount} ${v.perm} ${v.uid} ${v.gid} ${v.age} ${v.argu}`);
      }
      return lines.join('\n');
    }
  }
};
