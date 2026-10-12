FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm install --include=dev

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build
RUN mkdir -p dist && cp src/tailwind-plantillas.css dist/tailwind-plantillas.css 2>/dev/null || true

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]
