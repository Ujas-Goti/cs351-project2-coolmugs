FROM node:20
WORKDIR /app

COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/
RUN cd client && npm ci
RUN cd server && npm ci

COPY client ./client
COPY server ./server
RUN cd client && npm run build

ENV NODE_ENV=production
WORKDIR /app/server
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]