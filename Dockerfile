FROM node:13

WORKDIR '/client/src/app'

COPY package.json .
COPY package-lock.json .

ENV REACT_APP_BACKEND_URL=<backend-app-service-ip>:<port>

RUN npm install

COPY . .

CMD ["npm", "start"]