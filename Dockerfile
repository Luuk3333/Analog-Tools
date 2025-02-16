FROM node:20.5-alpine
ENV NODE_OPTIONS="--max-old-space-size=4096"
ARG CAPROVER_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}
ENV VITE_BUILD_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production
ENV PORT 80
EXPOSE 80
CMD ["node", "build"]
