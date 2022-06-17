FROM ubuntu:20.04
ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update && date
RUN apt-get install -y sudo
RUN apt-get install -y git
RUN apt-get install -y make gcc
RUN apt-get install -y curl wget aria2
EXPOSE 8080

ARG username=msgsvrusr
RUN echo "root:root" | chpasswd && \
  adduser --disabled-password --gecos "" "${username}" && \
  echo "${username}:${username}" | chpasswd && \
  echo "%${username}    ALL=(ALL)   NOPASSWD:    ALL" >> /etc/sudoers.d/${username} && \
  chmod 0440 /etc/sudoers.d/${username}
USER "${username}"
ARG home="/home/${username}"

RUN mkdir "${home}/tmp"
WORKDIR "${home}/tmp"
COPY scripts/installNodenv.sh "${home}/tmp"
COPY scripts/setupMsgServer.sh "${home}/tmp"
RUN sudo chown -R ${username} "${home}/tmp"


RUN "./installNodenv.sh"
COPY messaging-server "${home}/messaging-server/"
RUN sudo chown -R ${username} ~/messaging-server
RUN mkdir ~/.ssh
RUN echo "Host github.com\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
RUN ./setupMsgServer.sh
COPY scripts/startServer.sh "${home}/startServer.sh"
RUN sudo chown -R ${username} ~/startServer.sh
CMD sh ~/startServer.sh