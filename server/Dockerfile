# Use a node 12 base image
ARG NODE_VERSION=10
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

# Copy package.json and install node modules
COPY package.json .
RUN npm install

# Add app source code
ADD . /usr/src/app

# Build app
RUN npm run tsc

COPY --from=gcr.io/berglas/berglas:latest /bin/berglas /bin/berglas

ENTRYPOINT exec /bin/berglas exec -- npm run start
