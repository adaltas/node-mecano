#!/bin/bash

CWD=`pwd`/`dirname ${BASH_SOURCE}`

cd $CWD/docker
docker-compose up --abort-on-container-exit
