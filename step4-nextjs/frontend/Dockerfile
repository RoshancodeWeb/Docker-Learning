# Recipe for the Next.js frontend image (DEV version — runs "next dev").
#
# For a real production image you'd use a multi-stage build with
# "next build" + the slim "standalone" output. That's the natural Step 5.

FROM node:20-alpine

WORKDIR /app

# Copy dependency files first so "npm install" stays cached when only code changes.
COPY package*.json ./
RUN npm install

# Copy the rest of the source code.
COPY . .

EXPOSE 3000

# Run the Next.js dev server (hot reload). The compose file mounts our code
# over /app so edits on the Mac show up live.
CMD ["npm", "run", "dev"]
