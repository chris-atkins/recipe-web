FROM centos:centos6
RUN curl --silent --location https://rpm.nodesource.com/setup | bash -
RUN yum -y install nodejs
RUN yum install tar
COPY . /src
COPY ./run-on-server.sh /
EXPOSE 8000
CMD ["sh", "run-on-server.sh"]