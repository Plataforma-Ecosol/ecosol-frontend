# Imagem do frontend público (Next.js).
#
# Dois estágios: o primeiro instala e compila, o segundo carrega só o que roda.
# Sem a separação, a imagem final levaria junto todo o `node_modules` de
# desenvolvimento — dezenas de megabytes de compilador e ferramenta de teste
# que nenhum servidor precisa executar.

# --- Estágio 1: build -------------------------------------------------------
FROM node:22-slim AS build

WORKDIR /app

# `package*.json` antes do código, de propósito: enquanto as dependências não
# mudarem, o Docker reaproveita a camada de instalação e o build fica em
# segundos. Copiar tudo de uma vez invalidaria o cache a cada linha editada.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# O `next build` precisa das variáveis para pré-renderizar as páginas que
# consultam a API. Em produção elas vêm do ambiente do orquestrador.
ARG API_URL=http://backend:8001
ARG API_URL_PUBLICA=http://localhost:8001
# Sem valor padrão: vazio aqui é lido por `site.ts` como "não definida", e o
# endereço da área da equipe cai no derivado de API_URL_PUBLICA.
ARG ADMIN_URL
ENV API_URL=$API_URL
ENV API_URL_PUBLICA=$API_URL_PUBLICA
ENV ADMIN_URL=$ADMIN_URL

RUN npm run build

# --- Estágio 2: execução ----------------------------------------------------
FROM node:22-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

# `node` é usuário sem privilégio, já presente na imagem oficial. Rodar como
# root dentro do container é risco desnecessário: se alguém escapar do
# processo, escapa como root.
USER node

# `public/` guarda a logo (`public/brand/`): sem esta linha, o site sobe e a
# logo do cabeçalho e do rodapé sai quebrada, sem erro nenhum no build.
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
