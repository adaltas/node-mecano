// Generated by CoffeeScript 2.4.1
// # Miscellaneous kerberos functions

// ## kinit
var krb5;

krb5 = module.exports;

module.exports.kinit = function(options) {
  var cmd;
  cmd = "kinit";
  if (options.keytab === true) {
    " -k";
  } else if (options.keytab && typeof options.keytab === 'string') {
    cmd += ` -kt ${options.keytab}`;
  } else if (options.password) {
    cmd = `echo ${options.password} | ${cmd}`;
  } else {
    throw Error("Incoherent options: expects one of keytab or password");
  }
  cmd += ` ${options.principal}`;
  return cmd = krb5.su(options, cmd);
};

module.exports.su = function(options, cmd) {
  if (options.uid) {
    cmd = `su - ${options.uid} -c '${cmd}'`;
  }
  return cmd;
};
