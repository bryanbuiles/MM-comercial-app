# Solo para la prueba local del build estatico (produccion se publica en S3 + CloudFront)
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NG_CONFIGURATION=production
RUN npx ng build --configuration ${NG_CONFIGURATION}

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/MM-comercial-app/browser /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/ > /dev/null || exit 1
