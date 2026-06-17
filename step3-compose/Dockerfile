# Same recipe idea as Step 2 — this builds an image for OUR app only.
# (Redis is NOT built here — we pull its ready-made image in docker-compose.yml.)

FROM node:20-alpine

WORKDIR /app


# Copy dependency files first so "npm install" stays cached when only code changes.

COPY package*.json ./
RUN npm install

# Copy the rest of our source code.
COPY . .

EXPOSE 3000

CMD ["node","index.js"]
