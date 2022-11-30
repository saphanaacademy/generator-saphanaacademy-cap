FROM node:16-slim
WORKDIR /app
COPY db .
RUN npm install --only=production
RUN apt-get update
RUN apt-get install -y openssl python make g++
ENV NODE_ENV=production
USER node
CMD [ "npm", "start", "--", "--exit" ]