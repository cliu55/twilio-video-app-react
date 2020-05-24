FROM node:13 as build

WORKDIR /client

COPY package.json /client/package.json

COPY package-lock.json /client/package-lock.json

RUN npm install

RUN npm install react-scripts -g

COPY . /client

RUN npm run build

FROM nginx:1.16.0

COPY --from=build /client/build /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 3000

CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]