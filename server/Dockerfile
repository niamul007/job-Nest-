FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci                    # ✅ faster and reliable

COPY . .
RUN npm run build

# ✅ security - don't run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000
CMD ["npm", "start"]