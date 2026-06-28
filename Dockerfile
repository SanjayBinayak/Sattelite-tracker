FROM node:22-bookworm-slim

# Install Python3 + pip, needed for fetch-tle.py
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of the project
COPY . .

# Build the frontend (vite build -> dist/)
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
