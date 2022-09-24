#STAGE 1: Copy all necessary files from the repo and build the application
FROM node:lts as build

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY patches ./patches
COPY prisma ./prisma
COPY config ./config

RUN npm install
COPY . .

RUN npm run build

#STAGE 2: Copy necessary files and dist to next container and run it
FROM node:lts

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY patches ./patches
COPY prisma ./prisma
COPY config ./config

RUN npm install --omit=dev
COPY --from=build /app/dist dist
#build our database models
RUN npm run prisma:gen
ENTRYPOINT [ "npm", "run", "prod:db" ]