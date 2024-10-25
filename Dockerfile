FROM node:21-alpine

# Create app directory
WORKDIR /app
COPY package.json ./
RUN npm install

COPY app.ts ./
COPY tsconfig.json ./

EXPOSE 3000

RUN npm run build
CMD ["npm", "run", "production"]