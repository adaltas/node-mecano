FROM centos:7
MAINTAINER David Worms

# Install Node.js
ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 14.15.2
RUN yum install -y xz \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm -f "/node-v$NODE_VERSION-linux-x64.tar.xz"

RUN \
  # Install epel (requirement for service nginx)
  yum install -y epel-release \
  # Install supervisor \
  yum install -y iproute python-setuptools hostname inotify-tools yum-utils which && \
  easy_install supervisor

# Install SSH
RUN yum install -y openssh-server openssh-clients \
  && ssh-keygen -t rsa -f ~/.ssh/id_rsa -N '' \
  && cat ~/.ssh/id_rsa.pub > ~/.ssh/authorized_keys \
  && ssh-keygen -f /etc/ssh/ssh_host_rsa_key

# Install docker
RUN yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
RUN yum install -y docker-ce
RUN curl -L https://github.com/docker/compose/releases/download/1.19.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
RUN chmod +x /usr/local/bin/docker-compose

RUN yum clean all
ADD ./supervisord.conf /etc/supervisord.conf

ADD ./entrypoint.sh /entrypoint.sh
WORKDIR /nikita/packages/docker

ENTRYPOINT ["/entrypoint.sh"]
