# Based on https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker

# Base Image
FROM node:22-alpine

# Create Folder and give the node user permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Switch working dir in the image
WORKDIR /home/node/app

# Setup dependencies
COPY --chown=node:node package*.json ./
USER node
RUN npm install

# Copy our code
# .dockerignore excludes unwanted files
COPY --chown=node:node . .

EXPOSE 8001

# This allways creates a new volume for some reason
#VOLUME [ "./db" ]

# run the client
CMD [ "node", "server.js" ]

LABEL org.opencontainers.image.source=https://github.com/QuadcoreDevelopment/PlantManager