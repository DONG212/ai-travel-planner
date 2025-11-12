# ---- build client ----
FROM node:18 AS client
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./ 
RUN npm install
COPY client ./ 
RUN npm run build

# ---- build server ----
FROM node:18 AS server
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./ 
RUN npm install
COPY server ./ 
RUN npm run build

# ---- runtime ----
FROM node:18-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=server /app/server/dist ./server/dist
COPY --from=server /app/server/node_modules ./server/node_modules
COPY --from=client /app/client/dist ./server/public
EXPOSE 8080
CMD ["node", "server/dist/index.js"]