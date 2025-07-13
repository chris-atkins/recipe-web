FROM node:alpine3.22
RUN apk update
RUN apk add bzip2
RUN apk add git
RUN apk add libc6-compat
COPY . /src
COPY ./run-on-server.sh /
RUN cd src && npm install --unsafe-perm --legacy-peer-deps
EXPOSE 8000
CMD ["sh", "run-on-server.sh"]