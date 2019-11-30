FROM node:10-slim
WORKDIR /src

COPY package.json yarn.lock /src/
RUN yarn install --production --force \
  && mv node_modules node_modules_prod \
  && yarn

COPY . /src
RUN yarn compile

FROM node:10-slim

WORKDIR /src

COPY --from=0 /src/bin /src/bin
COPY --from=0 /src/node_modules_prod /src/bin/node_modules
COPY --from=0 /src/package.json /src/package.json
CMD yarn start