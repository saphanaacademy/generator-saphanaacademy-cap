FROM node:16-slim
WORKDIR /app
COPY srv .
<% if(multiTenant){ -%>
RUN chown -R node /app
<% } -%>
RUN npm install --only=production
<% if(hana || schemaName !== '' || hanaTargetHDI !== '' || multiTenant){ -%>
RUN apt-get update
RUN apt-get install -y openssl python make g++
<% } -%>
ENV NODE_ENV=production
EXPOSE 4004
USER node
CMD [ "npm", "start" ]