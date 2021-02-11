#!/bin/bash

cd `pwd`/`dirname ${BASH_SOURCE}`

npx coffee start.coffee
lxc exec nikita-ipa bash <<EOF
cd /nikita/packages/ipa
npx mocha 'test/**/*.coffee'
EOF
