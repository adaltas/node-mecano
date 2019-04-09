// Generated by CoffeeScript 2.4.1
var ini, string;

ini = require('ini');

string = require('./string');

module.exports = {
  
  // Remove undefined and null values
  clean: function(content, undefinedOnly) {
    var k, v;
    for (k in content) {
      v = content[k];
      if (v && typeof v === 'object') {
        content[k] = module.exports.clean(v, undefinedOnly);
        continue;
      }
      if (typeof v === 'undefined') {
        delete content[k];
      }
      if (!undefinedOnly && v === null) {
        delete content[k];
      }
    }
    return content;
  },
  safe: function(val) {
    if (typeof val !== "string" || val.match(/[\r\n]/) || val.match(/^\[/) || (val.length > 1 && val.charAt(0) === "\"" && val.slice(-1) === "\"") || val !== val.trim()) {
      return JSON.stringify(val);
    } else {
      return val.replace(/;/g, '\\;');
    }
  },
  dotSplit: function (str) {
    return str.replace(/\1/g, '\2LITERAL\\1LITERAL\2')
           .replace(/\\\./g, '\1')
           .split(/\./).map(function (part) {
             return part.replace(/\1/g, '\\.')
                    .replace(/\2LITERAL\\1LITERAL\2/g, '\1')
           })
  },
  parse: function(content, options) {
    return ini.parse(content);
  },
  // parse: (str, options={}) ->
  //   TODO: braket level might be good, to parse sub curly sub levels 
  //   shall be delegated to `parse_brackets_then_curly` like its
  //   stringify counterpart is doing
  //   lines = require('@nikitajs/core/lib/misc/string').lines str
  //   current = data = {}
  //   stack = [current]
  //   comment = options.comment or ';'
  //   lines.forEach (line, _, __) ->
  //     return if not line or line.match(/^\s*$/)
  //     # Category level 1
  //     if match = line.match /^\s*\[(.+?)\]\s*$/
  //       keys = match[1].split '.'
  //       depth = keys.length
  //       # Create intermediate levels if they dont exist
  //       d = data
  //       if depth > 1 then for i in keys[0...keys.length]
  //         throw Error "Invalid Key: #{keys[i]}" if data[keys[i]]? and not typeof data[keys[i]] is 'object'
  //         d[keys[i]] ?= {}
  //         d = d[keys[i]]
  //       # if depth > 1 then for i in [0 ... depth]
  //       #   stack.push {}
  //       # Add a child
  //       if depth is stack.length
  //         parent = stack[depth - 1]
  //         parent[match[1]] = current = {}
  //         stack.push current
  //       # Move to parent or at the same level
  //       else if depth is stack.length - 1
  //         stack.splice depth, stack.length - depth
  //         parent = stack[depth - 1]
  //         parent[match[1]] = current = {}
  //         stack.push current
  //       # Invalid child hierarchy
  //       else
  //         throw Error "Invalid child #{match[1]}"
  //     else if match = line.match /^\s*(.+?)\s*=\s*\{\s*$/
  //       throw Error "Invalid Depth: inferior to 2, got #{depth}" if depth < 2
  //       # Add a child
  //       parent = stack[stack.length - 1]
  //       parent[match[1]] = current = {}
  //       stack.push current
  //     else if match = line.match /^\s*\}\s*$/
  //       throw Error "Invalid Depth: inferior to 2, got #{depth}" if depth < 2
  //       stack.pop()
  //     # comment
  //     else if comment and match = line.match ///^\s*(#{comment}.*)$///
  //       current[match[1]] = null
  //     # key value
  //     else if match = line.match /^\s*(.+?)\s*=\s*(.+)\s*$/
  //       if textmatch = match[2].match /^"(.*)"$/
  //         match[2] = textmatch[1].replace '\\"', '"'
  //       current[match[1]] = match[2]
  //     # else
  //     else if match = line.match /^\s*(.+?)\s*$/
  //       current[match[1]] = null
  //   data
  parse_brackets_then_curly: function(str, options = {}) {
    var comment, current, data, lines, stack;
    lines = require('@nikitajs/core/lib/misc/string').lines(str);
    current = data = {};
    stack = [current];
    comment = options.comment || ';';
    lines.forEach(function(line, _, __) {
      var key, match, parent, textmatch;
      if (!line || line.match(/^\s*$/)) {
        return;
      }
      // Category level 1
      if (match = line.match(/^\s*\[(.+?)\]\s*$/)) {
        key = match[1];
        current = data[key] = {};
        return stack = [current];
      } else if (match = line.match(/^\s*(.+?)\s*=\s*\{\s*$/)) {
        // Add a child
        parent = stack[stack.length - 1];
        parent[match[1]] = current = {};
        return stack.push(current);
      } else if (match = line.match(/^\s*\}\s*$/)) {
        if (stack.length === 0) {
          throw Error("Invalid Syntax: found extra \"}\"");
        }
        stack.pop();
        return current = stack[stack.length - 1];
      // comment
      } else if (comment && (match = line.match(RegExp(`^\\s*(${comment}.*)$`)))) {
        return current[match[1]] = null;
      // key value
      } else if (match = line.match(/^\s*(.+?)\s*=\s*(.+)\s*$/)) {
        if (textmatch = match[2].match(/^"(.*)"$/)) {
          match[2] = textmatch[1].replace('\\"', '"');
        }
        return current[match[1]] = match[2];
      // else
      } else if (match = line.match(/^\s*(.+?)\s*$/)) {
        return current[match[1]] = null;
      }
    });
    return data;
  },
  /*

  Each category is surrounded by one or several square brackets. The number of brackets indicates
  the depth of the category.
  Options are   

  *   `comment`   Default to ";"

   */
  parse_multi_brackets: function(str, options = {}) {
    var comment, current, data, lines, stack;
    lines = string.lines(str);
    current = data = {};
    stack = [current];
    comment = options.comment || ';';
    lines.forEach(function(line, _, __) {
      var depth, match, parent;
      if (!line || line.match(/^\s*$/)) {
        return;
      }
      // Category
      if (match = line.match(/^\s*(\[+)(.+?)(\]+)\s*$/)) {
        depth = match[1].length;
        // Add a child
        if (depth === stack.length) {
          parent = stack[depth - 1];
          parent[match[2]] = current = {};
          stack.push(current);
        }
        // Invalid child hierarchy
        if (depth > stack.length) {
          throw Error(`Invalid child ${match[2]}`);
        }
        // Move up or at the same level
        if (depth < stack.length) {
          stack.splice(depth, stack.length - depth);
          parent = stack[depth - 1];
          parent[match[2]] = current = {};
          return stack.push(current);
        }
      // comment
      } else if (comment && (match = line.match(RegExp(`^\\s*(${comment}.*)$`)))) {
        return current[match[1]] = null;
      // key value
      } else if (match = line.match(/^\s*(.+?)\s*=\s*(.+)\s*$/)) {
        return current[match[1]] = match[2];
      // else
      } else if (match = line.match(/^\s*(.+?)\s*$/)) {
        return current[match[1]] = null;
      }
    });
    return data;
  },
  /*
  Same as the parse_multi_brackets instead it takes in count values which are defined on several lines
  As an example the ambari-agent .ini configuration file

  *   `comment`   Default to ";"

   */
  parse_multi_brackets_multi_lines: function(str, options = {}) {
    var comment, current, data, lines, previous, stack, writing;
    lines = string.lines(str);
    current = data = {};
    stack = [current];
    comment = options.comment || ';';
    writing = false;
    previous = {};
    lines.forEach(function(line, _, __) {
      var depth, match, parent;
      if (!line || line.match(/^\s*$/)) {
        return;
      }
      // Category
      if (match = line.match(/^\s*(\[+)(.+?)(\]+)\s*$/)) {
        depth = match[1].length;
        // Add a child
        if (depth === stack.length) {
          parent = stack[depth - 1];
          parent[match[2]] = current = {};
          stack.push(current);
        }
        // Invalid child hierarchy
        if (depth > stack.length) {
          throw Error(`Invalid child ${match[2]}`);
        }
        // Move up or at the same level
        if (depth < stack.length) {
          stack.splice(depth, stack.length - depth);
          parent = stack[depth - 1];
          parent[match[2]] = current = {};
          return stack.push(current);
        }
      // comment
      } else if (comment && (match = line.match(RegExp(`^\\s*(${comment}.*)$`)))) {
        writing = false;
        return current[match[1]] = null;
      // key value
      } else if (match = line.match(/^\s*(.+?)\s*=\s*(.+)\s*$/)) {
        writing = false;
        current[match[1]] = match[2];
        previous = match[1];
        return writing = true;
      // else
      } else if (match = line.match(/^\s*(.+?)\s*$/)) {
        if (writing) {
          return current[previous] += match[1];
        } else {
          return current[match[1]] = null;
        }
      }
    });
    return data;
  },
  // same as ini parse but transform value which are true and type of true as ''
  // to be user by stringify_single_key
  stringify: function(obj, section, options = {}) {
    var children, dotSplit, out, safe;
    if (arguments.length === 2) {
      options = section;
      section = void 0;
    }
    if (options.separator == null) {
      options.separator = ' = ';
    }
    if (options.eol == null) {
      options.eol = !options.ssh && process.platform === "win32" ? "\r\n" : "\n";
    }
    if (options.escape == null) {
      options.escape = true;
    }
    safe = module.exports.safe;
    dotSplit = module.exports.dotSplit;
    children = [];
    out = "";
    Object.keys(obj).forEach(function(k, _, __) {
      var val;
      val = obj[k];
      if (val && Array.isArray(val)) {
        return val.forEach(function(item) {
          return out += safe(`${k}[]`) + options.separator + safe(item) + options.eol;
        });
      } else if (val && typeof val === "object") {
        return children.push(k);
      } else if (typeof val === 'boolean') {
        if (val === true) {
          return out += safe(k) + options.eol;
        } else {

        }
      } else {
        // disregard false value
        return out += safe(k) + options.separator + safe(val) + options.eol;
      }
    });
    if (section && out.length) {
      out = "[" + safe(section) + "]" + options.eol + out;
    }
    children.forEach((k, _, __) => {
      var child, nk;
      // escape the section name dot as some daemon could not parse it
      nk = options.escape ? dotSplit(k).join('\\.') : k;
      child = module.exports.stringify(obj[k], (section ? section + "." : "") + nk, options);
      if (out.length && child.length) {
        out += options.eol;
      }
      return out += child;
    });
    return out;
  },
  // works like stringify but write only the key when the value is ''
  // be careful when using ini.parse is parses single key line as key = true
  stringify_single_key: function(obj, section, options = {}) {
    var children, dotSplit, out, safe;
    if (arguments.length === 2) {
      options = section;
      section = void 0;
    }
    if (options.separator == null) {
      options.separator = ' = ';
    }
    if (options.eol == null) {
      options.eol = !options.ssh && process.platform === "win32" ? "\r\n" : "\n";
    }
    safe = module.exports.safe;
    dotSplit = module.exports.dotSplit;
    children = [];
    out = "";
    Object.keys(obj).forEach(function(k, _, __) {
      var val;
      val = obj[k];
      if (val && Array.isArray(val)) {
        return val.forEach(function(item) {
          return out += val === '' || val === true ? `${k}` + "\n" : safe(`${k}[]`) + options.separator + safe(item) + "\n";
        });
      } else if (val && typeof val === "object") {
        return children.push(k);
      } else {
        return out += val === '' || val === true ? `${k}` + options.eol : safe(k) + options.separator + safe(val) + options.eol;
      }
    });
    if (section && out.length) {
      out = "[" + safe(section) + "]" + options.eol + out;
    }
    children.forEach(function(k, _, __) {
      var child, nk;
      nk = dotSplit(k).join('\\.');
      child = module.exports.stringify_single_key(obj[k], (section ? section + "." : "") + nk, options);
      if (out.length && child.length) {
        out += options.eol;
      }
      return out += child;
    });
    return out;
  },
  stringify_square_then_curly: function(content, depth = 0, options = {}) {
    console.error('Deprecated Function: use stringify_brackets_then_curly instead of stringify_square_then_curly');
    return module.exports.stringify_brackets_then_curly(content, depth, options);
  },
  stringify_brackets_then_curly: function(content, depth = 0, options = {}) {
    var element, i, indent, isArray, isBoolean, isNull, isObj, j, k, l, len, out, outa, prefix, ref, v;
    if (arguments.length === 2) {
      options = depth;
      depth = 0;
    }
    if (options.separator == null) {
      options.separator = ' = ';
    }
    if (options.eol == null) {
      options.eol = !options.ssh && process.platform === "win32" ? "\r\n" : "\n";
    }
    out = '';
    indent = ' ';
    prefix = '';
    for (i = j = 0, ref = depth; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      prefix += indent;
    }
    for (k in content) {
      v = content[k];
      // isUndefined = typeof v is 'undefined'
      isBoolean = typeof v === 'boolean';
      isNull = v === null;
      isArray = Array.isArray(v);
      isObj = typeof v === 'object' && !isNull && !isArray;
      if (isObj) {
        if (depth === 0) {
          out += `${prefix}[${k}]${options.eol}`;
          out += module.exports.stringify_brackets_then_curly(v, depth + 1, options);
          out += `${options.eol}`;
        } else {
          out += `${prefix}${k}${options.separator}{${options.eol}`;
          out += module.exports.stringify_brackets_then_curly(v, depth + 1, options);
          out += `${prefix}}${options.eol}`;
        }
      } else {
        if (isArray) {
          outa = [];
          for (l = 0, len = v.length; l < len; l++) {
            element = v[l];
            outa.push(`${prefix}${k}${options.separator}${element}`);
          }
          out += outa.join(`${options.eol}`);
        } else if (isNull) {
          out += `${prefix}${k}${options.separator}null`;
        } else if (isBoolean) {
          out += `${prefix}${k}${options.separator}${(v ? 'true' : 'false')}`;
        } else {
          out += `${prefix}${k}${options.separator}${v}`;
        }
        out += `${options.eol}`;
      }
    }
    return out;
  },
  /*
  Each category is surrounded by one or several square brackets. The number of brackets indicates
  the depth of the category.
  Taking now indent option into consideration: some file are indent aware ambari-agent .ini file
  */
  stringify_multi_brackets: function(content, depth = 0, options = {}) {
    var i, indent, isBoolean, isNull, isObj, j, k, out, prefix, ref, v;
    if (arguments.length === 2) {
      options = depth;
      depth = 0;
    }
    if (options.separator == null) {
      options.separator = ' = ';
    }
    if (options.eol == null) {
      options.eol = !options.ssh && process.platform === "win32" ? "\r\n" : "\n";
    }
    out = '';
    indent = options.indent != null ? options.indent : '  ';
    prefix = '';
    for (i = j = 0, ref = depth; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      prefix += indent;
    }
    for (k in content) {
      v = content[k];
      // isUndefined = typeof v is 'undefined'
      isBoolean = typeof v === 'boolean';
      isNull = v === null;
      isObj = typeof v === 'object' && !isNull;
      if (isObj) {
        continue;
      }
      if (isNull) {
        out += `${prefix}${k}`;
      } else if (isBoolean) {
        out += `${prefix}${k}${options.separator}${(v ? 'true' : 'false')}`;
      } else {
        out += `${prefix}${k}${options.separator}${v}`;
      }
      out += `${options.eol}`;
    }
    for (k in content) {
      v = content[k];
      isNull = v === null;
      isObj = typeof v === 'object' && !isNull;
      if (!isObj) {
        continue;
      }
      out += `${prefix}${string.repeat('[', depth + 1)}${k}${string.repeat(']', depth + 1)}${options.eol}`;
      out += module.exports.stringify_multi_brackets(v, depth + 1, options);
    }
    return out;
  }
};
