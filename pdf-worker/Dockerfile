FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build
RUN mkdir -p dist && cp src/tailwind-plantillas.css dist/tailwind-plantillas.css 2>/dev/null || true

EXPOSE 3001

CMD ["npm", "start"]
