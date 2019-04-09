// Generated by CoffeeScript 2.4.1
// # Misc LDAP
module.exports = {
  acl: {
    // ## Parse ACLs

    // Parse one or multiple "olcAccess" entries.

    // Example:

    // ```
    // ldap.acl
    // .parse [ '{0}to attrs=userPassword,userPKCS12 by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth" manage by dn.exact="cn=nssproxy,ou=users,dc=adaltas,dc=com" read by self write by anonymous auth by * none' ]
    // .should.eql [
    //   index: 0
    //   to: 'attrs=userPassword,userPKCS12'
    //   by: [ 'dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth" manage'
    //     'dn.exact="cn=nssproxy,ou=users,dc=adaltas,dc=com" read'
    //     'self write'
    //     'anonymous auth'
    //     '* none'
    //   ]
    // ]
    // ```
    parse: function(olcAccesses) {
      var i, isArray, match, olcAccess;
      isArray = Array.isArray(olcAccesses);
      if (!isArray) {
        olcAccesses = [olcAccesses];
      }
      olcAccesses = (function() {
        var j, len, results;
        results = [];
        for (i = j = 0, len = olcAccesses.length; j < len; i = ++j) {
          olcAccess = olcAccesses[i];
          match = /^\{(\d+)\}to\s+(.*?)(\s*by\s+|$)(.*)$/.exec(olcAccess);
          if (!match) {
            throw Error('Invalid olcAccess entry');
          }
          results.push({
            index: parseInt(match[1], 10),
            to: match[2],
            by: match[4].split(/\s+by\s+/)
          });
        }
        return results;
      })();
      if (isArray) {
        return olcAccesses;
      } else {
        return olcAccesses[0];
      }
    },
    // # Stringify ACLs

    // Stringify one or multiple "olcAccess" entries.
    stringify: function(olcAccesses) {
      var bie, i, isArray, j, l, len, len1, olcAccess, ref, value;
      isArray = Array.isArray(olcAccesses);
      if (!isArray) {
        olcAccesses = [olcAccesses];
      }
      for (i = j = 0, len = olcAccesses.length; j < len; i = ++j) {
        olcAccess = olcAccesses[i];
        value = `{${olcAccess.index}}to ${olcAccess.to}`;
        ref = olcAccess.by;
        for (l = 0, len1 = ref.length; l < len1; l++) {
          bie = ref[l];
          value += ` by ${bie}`;
        }
        olcAccesses[i] = value;
      }
      if (isArray) {
        return olcAccesses;
      } else {
        return olcAccesses[0];
      }
    }
  },
  index: {
    // ## Parse Index

    // Parse one or multiple "olcDbIndex" entries.
    parse: function(indexes) {
      var isArray;
      isArray = Array.isArray(indexes);
      if (!isArray) {
        indexes = [indexes];
      }
      indexes.forEach(function(index, i) {
        var k, v;
        if (i === 0) {
          indexes = {};
        }
        [k, v] = index.split(' ');
        return indexes[k] = v;
      });
      if (isArray) {
        return indexes;
      } else {
        return indexes[0];
      }
    },
    // ## Stringify Index

    // Stringify one or multiple "olcDbIndex" entries.
    stringify: function(indexes) {
      var isArray, k, v;
      isArray = Array.isArray(indexes);
      if (!isArray) {
        indexes = [indexes];
      }
      indexes = (function() {
        var results;
        results = [];
        for (k in indexes) {
          v = indexes[k];
          results.push(`${k} ${v}`);
        }
        return results;
      })();
      if (isArray) {
        return indexes;
      } else {
        return indexes[0];
      }
    }
  }
};
