# ─────────────────────────────────────────────────────────────
#  Dockerfile = the recipe for building our app's image.
#  Each line is a "step" Docker runs, top to bottom.
# ─────────────────────────────────────────────────────────────

# 1. Start FROM a base image that already has Node.js installed.
#    "20-alpine" = Node v20 on Alpine Linux (a tiny, lightweight OS).
FROM node:20-alpine

# 2. Set the working directory inside the container.
#    Everything after this happens in /app (Docker creates it for us).
WORKDIR /app

# 3. Copy ONLY the package files first (not all our code yet).
#    Why? Docker caches layers. As long as these files don't change,
#    Docker reuses the cached "npm install" below instead of re-running it.
#    This makes future builds much faster.
COPY package*.json ./

# 4. Install our dependencies (Express) inside the container.
RUN npm install

# 5. Now copy the rest of our source code into the image.
COPY . .

# 6. Document which port the app uses. (This is informational;
#    the real mapping happens with -p when we run the container.)
EXPOSE 3000

# 7. The command that runs when the container STARTS.
CMD ["node", "index.js"]



# FROM node:20-alpine

# WORKDIR /app

# COPY  package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["node","index.js"]