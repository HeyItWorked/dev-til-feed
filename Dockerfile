FROM node:20-bookworm
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm install

COPY . .
RUN cd client && npm run build
RUN mkdir -p data

ENV PORT=3001
ENV DB_PATH=/app/data/til.db
EXPOSE 3001

CMD ["sh", "-c", "npx drizzle-kit push && npx tsx src/server.ts"]
