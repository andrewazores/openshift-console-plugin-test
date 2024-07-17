ARG APP_DIR=/opt/app-root/src

FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS frontend_build
USER root
RUN command -v yarn || npm i -g yarn
ADD . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install && yarn build

FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS backend_build
USER root
ADD backend /usr/src/app
WORKDIR /usr/src/app
RUN npm install

FROM registry.access.redhat.com/ubi9/nodejs-20-minimal:latest
ARG APP_DIR
COPY ./backend/server.js $APP_DIR
COPY --from=backend_build /usr/src/app/node_modules/ $APP_DIR/node_modules
COPY --from=frontend_build /usr/src/app/dist $APP_DIR/html
ENTRYPOINT [ "/usr/bin/node", "/opt/app-root/src/server.js" ]
