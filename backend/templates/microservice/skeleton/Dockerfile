FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Não rodar como root: se o processo for comprometido, o atacante não herda
# a raiz do container.
USER node

EXPOSE ${{ values.porta }}

CMD ["node", "src/index.js"]
