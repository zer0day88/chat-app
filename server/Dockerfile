FROM node:lts-alpine
WORKDIR /app
COPY server/package.json /app
RUN npm install
COPY . /app
CMD ["node","index.js"]