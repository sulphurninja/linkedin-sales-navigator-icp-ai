# Use official Apify Node.js base image
FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Run the compiled code
CMD npm start

