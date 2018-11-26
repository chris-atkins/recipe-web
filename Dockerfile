FROM centos:7
RUN yum install -y wget
RUN cd ~
RUN wget http://nodejs.org/dist/v10.13.0/node-v10.13.0-linux-x64.tar.gz
RUN tar --strip-components 1 -xzvf node-v* -C /usr/local
COPY . /src
COPY ./run-on-server.sh /
RUN cd src && npm install
EXPOSE 8000
CMD ["sh", "run-on-server.sh"]