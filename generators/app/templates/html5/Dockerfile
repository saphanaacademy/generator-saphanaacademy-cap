FROM node:16-slim
WORKDIR /app
RUN chown -R node /app
COPY html5 .
RUN npm install --only=production
ENV NODE_ENV=production
USER node
CMD [ "npm", "start" ]