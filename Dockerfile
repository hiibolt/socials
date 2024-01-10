FROM node:21-alpine3.18
WORKDIR /
COPY . .
CMD ["node", "index.js"]
EXPOSE 4000
