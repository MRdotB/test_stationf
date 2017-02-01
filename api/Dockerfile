FROM node:latest

EXPOSE 4242

ADD . /app
WORKDIR /app

CMD export NODE_ENV=production && npm i && node migration.js && npm run start
