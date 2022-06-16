FROM ubuntu:20.04
ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y make gcc
RUN apt-get install -y nginx
COPY ./proxy.conf /etc/nginx/conf.d/proxy.conf
CMD [ "/usr/sbin/nginx" ]
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
EXPOSE 8000

RUN useradd -m proxyuser
#USER proxyuser
RUN git clone https://github.com/nodenv/nodenv.git ~/.nodenv
RUN cd ~/.nodenv && src/configure && make -C src
ENV PATH /home/proxyuser/.nodenv/bin:$PATH
#RUN nodenv init
#CMD [ "./nodenvInit.sh" ]
COPY messaging-server/src /home/proxyuser/messaging-server/

#CMD 