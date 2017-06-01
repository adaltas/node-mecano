
# `nikita.java.keystore_add(options, [callback])`

Add certificates, private keys and certificate authorities to java keystores
and trustores.

## Options

* `name` (string)   
  Name of the certificate, required if a certificate is provided.   
* `caname` (string)   
  Name of the certificate authority (CA), required.   
* `cacert` (string)   
  Path to the certificate authority (CA), required.   
* `openssl` (string)   
  Path to OpenSSl command line tool, default to "openssl".   
* `parent` (boolean|object)   
  Create parent directory with provided options if an object or default 
  system options if "true".   
* `storepass` (string)   
  Password to manage the keystore.   

## Callback parameters

* `err` (object|null)   
  Error object if any.   
* `status` (boolean)   
  Indicates if the certificated was inserted.   

## CA Cert Chains

In case the CA file reference a chain of certificates, each certificate will be
referenced by a unique incremented alias, starting at 0. For example if the 
alias value is "my-alias", the aliases will be "my-alias-0" then "my-alias-1"... 

## Relevant Java properties

* `javax.net.ssl.trustStore`
* `javax.net.ssl.trustStorePassword`
* `javax.net.ssl.keyStore`
* `javax.net.ssl.keyStoreType`
* `javax.net.ssl.keyStorePassword`

## Relevant commands

* View the content of a Java KeyStore (JKS) and Java TrustStore:
  `keytool -list -v -keystore $keystore -storepass $storepass`
  `keytool -list -v -keystore $keystore -storepass $storepass -alias $caname`
  Note, alias is optional and may reference a CA or a certificate
* View the content of a ".pem" certificate:
  `openssl x509 -in cert.pem -text`
  `keytool -printcert -file certs.pem`
* Change the password of a keystore:   
  `keytool -storepasswd -keystore my.keystore`
* Change the key's password:   
  `keytool -keypasswd -alias <key_name> -keystore my.keystore`

## Uploading public and private keys into a keystore

```js
require('nikita').java.keystore_add([{
  keystore: java_home + '/lib/security/cacerts',
  storepass: 'changeit',
  caname: 'my_ca_certificate',
  cacert: '/tmp/cacert.pem',
  key: "/tmp/private_key.pem",
  cert: "/tmp/public_cert.pem",
  keypass: 'mypassword',
  name: 'node_1'
}, function(err, status){ /* do sth */ });
```

## Uploading a certificate authority

```js
require('nikita').java.keystore_add([{
  keystore: java_home + '/lib/security/cacerts',
  storepass: 'changeit',
  caname: 'my_ca_certificate',
  cacert: '/tmp/cacert.pem'
}, function(err, status){ /* do sth */ });
```

## Source Code

    module.exports = (options) ->
      throw Error "Required option 'keystore'" unless options.keystore
      throw Error "Required option 'storepass'" unless options.storepass
      throw Error "Required option 'key' for certificate" if options.cert and not options.key
      throw Error "Required option 'keypass' for certificate" if options.cert and not options.keypass
      throw Error "Required option 'name' for certificate" if options.cert and not options.name
      # throw Error "Required option 'caname'" unless options.caname
      # throw Error "Required option 'cacert'" unless options.cacert
      options.parent ?= {}
      options.openssl ?= 'openssl'
      tmp_location = "/tmp/nikita/java_keystore_#{Date.now()}"
      files =
        cert: if options.cert? and options.local then  "#{tmp_location}/#{path.basename options.cert}" else options.cert
        cacert: if options.local then  "#{tmp_location}/#{path.basename options.cacert}" else options.cacert
        key: if options.key? and options.local then  "#{tmp_location}/#{path.basename options.key}" else options.key
      @system.mkdir
        target: "#{tmp_location}"
        mode: 0o0700
        shy: true
      @file.download
        if: options.local and options.cacert
        source: options.cacert
        target: files.cacert
        mode: 0o0600
        shy: true
      @file.download
        if: options.local and options.cert
        source: options.cert
        target: files.cert
        mode: 0o0600
        shy: true
      @file.download
        if: options.local and options.key
        source: options.key
        target: files.key
        mode: 0o0600
        shy: true
      @system.mkdir options, options.parent,
        header: null
        unless_exists: true
        target: path.dirname options.keystore
      @system.execute # Deal with key and certificate
        bash: true
        cmd: """
        cleanup () {
          [ -n "#{if options.cacert then '1' else ''}" ] || rm -rf #{tmp_location};
        }
        if ! which #{options.openssl}; then echo 'OpenSSL command line tool not detected'; cleanup; exit 4; fi
        [ -f #{files.cert} ] || (cleanup; exit 6)
        # mkdir -p -m 700 #{tmp_location}
        user=`#{options.openssl} x509  -noout -in "#{files.cert}" -md5 -fingerprint | sed 's/\\(.*\\)=\\(.*\\)/\\2/' | cat`
        keystore=`keytool -list -v -keystore #{options.keystore} -alias #{options.name} -storepass #{options.storepass} | grep MD5: | sed -E 's/.+MD5: +(.*)/\\1/'`
        echo "User Certificate: $user"
        echo "Keystore Certificate: $keystore"
        if [[ "$user" == "$keystore" ]]; then cleanup; exit 5; fi
        # Create a PKCS12 file that contains key and certificate
        #{options.openssl} pkcs12 -export \
          -in "#{files.cert}" -inkey "#{files.key}" \
          -out "#{tmp_location}/pkcs12" -name #{options.name} \
          -password pass:#{options.keypass}
          #-CAfile "#{tmp_location}/cacert" -caname #{options.caname} \
        # Import PKCS12 into keystore
        keytool -noprompt -importkeystore \
          -destkeystore #{options.keystore} \
          -deststorepass #{options.storepass} \
          -destkeypass #{options.keypass} \
          -srckeystore "#{tmp_location}/pkcs12" -srcstoretype PKCS12 -srcstorepass #{options.keypass} \
          -alias #{options.name}
        """
        trap: true
        if: !!options.cert
        code_skipped: 5 # OpenSSL exit 3 if file does not exists
      , (err) ->
        throw Error "OpenSSL command line tool not detected" if err?.code is 4
        throw Error "Keystore file does not exists" if err?.code is 6
      @system.execute # Deal with CACert
        if: options.cacert
        bash: true
        cmd: """
        # cleanup () { rm -rf #{tmp_location}; }
        cleanup () { echo 'clean'; }
        # Check password
        if [ -f #{options.keystore} ] && ! keytool -list -keystore #{options.keystore} -storepass #{options.storepass} >/dev/null; then
          # Keystore password is invalid, change it manually with:
          # keytool -storepasswd -keystore #{options.keystore} -storepass #{options.storepass}
          cleanup; exit 2
        fi
        [ -f #{files.cacert} ] || (echo 'CA file doesnt not exists: #{files.cacert} 1>&2'; cleanup; exit 3)
        # Import CACert
        PEM_FILE=#{files.cacert}
        CERTS=$(grep 'END CERTIFICATE' $PEM_FILE| wc -l)
        code=5
        for N in $(seq 0 $(($CERTS - 1))); do
          if [[ $CERTS == '1' ]]; then
            ALIAS="#{options.caname}"
          else
            ALIAS="#{options.caname}-$N"
          fi
          # Isolate cert into a file
          CACERT_FILE=#{tmp_location}/$ALIAS
          cat $PEM_FILE | awk "n==$N { print }; /END CERTIFICATE/ { n++ }" > $CACERT_FILE
          # Read user CACert signature
          user=`#{options.openssl} x509  -noout -in "$CACERT_FILE" -md5 -fingerprint | sed 's/\\(.*\\)=\\(.*\\)/\\2/'`
          # Read registered CACert signature
          keystore=`keytool -list -v -keystore #{options.keystore} -alias $ALIAS -storepass #{options.storepass} | grep MD5: | sed -E 's/.+MD5: +(.*)/\\1/'`
          echo "User CA Cert: $user"
          echo "Keystore CA Cert: $keystore"
          if [[ "$user" == "$keystore" ]]; then echo 'Identical Signature'; code=5; continue; fi
          # Remove CACert if signature doesnt match
          if [[ "$keystore" != "" ]]; then
            keytool -delete \
              -keystore #{options.keystore} \
              -storepass #{options.storepass} \
              -alias $ALIAS
          fi
          keytool -noprompt -import -trustcacerts -alias $ALIAS -keystore #{options.keystore} -storepass #{options.storepass} -file #{tmp_location}/$ALIAS
          code=0
        done
        cleanup
        exit $code
        """
        trap: true
        code_skipped: 5
      , (err) ->
        throw Error "CA file does not exist: #{files.cacert}" if err?.code is 3
      @system.chown
        target: options.keystore
        uid: options.uid
        gid: options.gid
        if: options.uid? or options.gid?
      @system.chmod
        target: options.keystore
        mode: options.mode
        if: options.mode?

## Dependencies

    path = require 'path'
