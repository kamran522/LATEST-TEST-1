FROM node:20-alpine

RUN apk update && apk add --no-cache ffmpeg python3 make g++

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --ignore-engines

COPY . .

EXPOSE 8080

CMD ["yarn", "start"]
