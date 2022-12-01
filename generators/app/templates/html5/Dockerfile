FROM node:16-slim
WORKDIR /app
COPY html5 .
RUN chown -R node /app
RUN npm install --only=production
ENV NODE_ENV=production
USER node
CMD [ "npm", "start" ]