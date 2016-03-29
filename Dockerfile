FROM centos:centos6
RUN curl --silent --location https://rpm.nodesource.com/setup | bash -
RUN yum -y install nodejs
RUN npm -g install npm@latest
RUN yum -y install tar
RUN yum -y install bzip2
COPY . /src
COPY ./run-on-server.sh /
RUN cd src && npm install
EXPOSE 8000
CMD ["sh", "run-on-server.sh"]