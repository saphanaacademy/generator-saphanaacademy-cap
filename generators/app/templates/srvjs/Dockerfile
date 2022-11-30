FROM node:16-slim
WORKDIR /app
COPY srvjs .
RUN npm install --only=production
<% if(hana){ -%>
RUN apt-get update
RUN apt-get install -y openssl python make g++
<% } -%>
ENV NODE_ENV=production
EXPOSE 5001
USER node
CMD [ "npm", "start" ]