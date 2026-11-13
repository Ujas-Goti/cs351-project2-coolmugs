
# Build the React frontend.
FROM node:22-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Prepare the Express backend.
FROM node:22-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 8080

CMD ["npm", "start", "--prefix", "server"]
