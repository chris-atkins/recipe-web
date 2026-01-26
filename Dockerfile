FROM node:22-alpine
RUN apk update
RUN apk add bzip2
RUN apk add git
RUN apk add libc6-compat
COPY . /src
COPY ./run-on-server.sh /
RUN cd /src && npm install --unsafe-perm --legacy-peer-deps
RUN cd /src && npm run build
EXPOSE 8000
CMD ["sh", "run-on-server.sh"]