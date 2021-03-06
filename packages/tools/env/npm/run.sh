#!/bin/bash
set -e

cd `pwd`/`dirname ${BASH_SOURCE}`

npx coffee start.coffee
lxc exec \
  --cwd /nikita/packages/tools \
  nikita-tools-npm -- \
  bash -l -c "npm run test:local"
lxc stop nikita-tools-npm
