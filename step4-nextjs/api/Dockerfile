# Recipe for the API image (same shape as Step 3's Dockerfile).

FROM node:20-alpine

WORKDIR /app

# Copy dependency files first so "npm install" stays cached when only code changes.
COPY package*.json ./
RUN npm install

# Copy the rest of the source code.
COPY . .

EXPOSE 4000

# Default (production) command. In docker-compose we override this with
# "npm run dev" so nodemon gives us live reload during development.
CMD ["node", "index.js"]
