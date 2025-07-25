# 🚀 RiggerHub-web Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the RiggerHub web platform, part of the Rigger Project ecosystem built by Jack Jonas & Tia to support the ChaseWhiteRabbit NGO.

## Core Team

**Jack Jonas**  
Lead Architect & DevOps Engineer  
[jackjonas95@gmail.com](mailto:jackjonas95@gmail.com)

**Tia**  
Principal Developer & Security Lead  
[tiatheone@protonmail.com](mailto:tiatheone@protonmail.com)

## Infrastructure Architecture

### VPS Integration

RiggerHub-web is deployed using our enterprise VPS infrastructure:

#### Primary Infrastructure Hosts

- **Backend Services**: [supabase.sxc.codes](https://supabase.sxc.codes)
  - IPv4: `93.127.167.157`
  - IPv6: `2a02:4780:12:123a::1`
  - Role: Database, authentication, and backend-as-a-service
  - OS: Ubuntu 24.04 with Supabase

- **CI/CD & Deployment**: [docker.sxc.codes](https://docker.sxc.codes)
  - IPv4: `145.223.22.7`
  - IPv6: `2a02:4780:12:3edf::1`
  - Role: Container builds, testing, and deployment orchestration
  - OS: Ubuntu 24.04 with Docker

#### Supporting Infrastructure

- **Monitoring**: [grafana.sxc.codes](https://grafana.sxc.codes)
  - IPv4: `153.92.214.1`
  - IPv6: `2a02:4780:10:bfb9::1`
  - Role: Application performance and system monitoring

- **Container Registry**: [docker.tiation.net](https://docker.tiation.net)
  - IPv4: `145.223.22.9`
  - Role: Secondary runner or staging container host

- **Orchestration**: [gitlab.sxc.codes](https://gitlab.sxc.codes)
  - IPv4: `145.223.22.10`
  - IPv6: `2a02:4780:12:3ef1::1`
  - Role: Git-based CI/CD orchestration + GitLab runners

## Deployment Environments

### 1. Development Environment

**Local Development Setup:**
```bash
# Clone the repository
git clone git@github.com:tiation/RiggerHub-web.git
cd RiggerHub-web

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with development credentials

# Start development server
npm run dev
```

**Environment Variables (Development):**
```bash
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-development-anon-key
VITE_APP_ENV=development
VITE_API_URL=http://localhost:5000
```

### 2. Staging Environment

**Staging Deployment:**
```bash
# Build staging version
npm run build:staging

# Deploy to staging VPS
ssh root@docker.tiation.net
docker-compose -f docker-compose.staging.yml up -d
```

**Environment Variables (Staging):**
```bash
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_APP_ENV=staging
VITE_API_URL=https://api-staging.riggerhub.com.au
```

### 3. Production Environment

**Production Deployment:**
```bash
# Build production version
npm run build

# Deploy to production VPS
ssh root@docker.sxc.codes
docker-compose -f docker-compose.production.yml up -d
```

**Environment Variables (Production):**
```bash
VITE_SUPABASE_URL=https://production-project.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
VITE_APP_ENV=production
VITE_API_URL=https://api.riggerhub.com.au
```

## Docker Configuration

### Production Dockerfile

```dockerfile
# Production Dockerfile for RiggerHub-web
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Configuration

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  riggerhub-web:
    build:
      context: .
      dockerfile: Dockerfile.production
    container_name: riggerhub-web
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    networks:
      - rigger-network
    restart: unless-stopped

networks:
  rigger-network:
    external: true
```

## CI/CD Pipeline

### GitLab CI Configuration

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_IMAGE: registry.gitlab.com/riggerhub/riggerhub-web

test:
  stage: test
  image: node:18-alpine
  script:
    - npm ci
    - npm run lint
    - npm run test
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $DOCKER_IMAGE:$CI_COMMIT_SHA .
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
  only:
    - main

deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - ssh -o StrictHostKeyChecking=no root@docker.sxc.codes "
        cd /opt/riggerhub-web &&
        docker-compose pull &&
        docker-compose up -d --remove-orphans"
  only:
    - main
  when: manual
```

### GitHub Actions Alternative

```yaml
# .github/workflows/deploy.yml
name: Deploy RiggerHub-web

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
    - run: npm run test
    - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: docker.sxc.codes
        username: root
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /opt/riggerhub-web
          git pull origin main
          docker-compose up -d --build
```

## SSL/TLS Configuration

### Nginx Configuration with SSL

```nginx
# nginx.conf
server {
    listen 80;
    server_name riggerhub.com.au www.riggerhub.com.au;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name riggerhub.com.au www.riggerhub.com.au;

    ssl_certificate /etc/nginx/ssl/riggerhub.com.au.crt;
    ssl_certificate_key /etc/nginx/ssl/riggerhub.com.au.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self'" always;
    }

    location /api {
        proxy_pass https://api.riggerhub.com.au;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Migration

### Supabase Schema Deployment

```sql
-- Run on supabase.sxc.codes
-- Database migration for RiggerHub

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    location TEXT,
    certifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

## Monitoring and Logging

### Application Monitoring

**Grafana Dashboard Configuration:**
- CPU and Memory usage tracking
- Response time monitoring
- Error rate tracking
- User session analytics

**Log Aggregation:**
```bash
# Ship logs to centralized logging
docker run -d --name filebeat \
  -v /var/log:/var/log:ro \
  -v /var/lib/docker/containers:/var/lib/docker/containers:ro \
  elastic/filebeat:7.15.0
```

### Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

## Backup and Recovery

### Database Backup

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h supabase.sxc.codes -U postgres riggerhub > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://riggerhub-backups/
```

### Application Backup

```bash
# Backup static assets and configuration
tar -czf riggerhub-web-$DATE.tar.gz \
  /opt/riggerhub-web/dist \
  /opt/riggerhub-web/nginx.conf \
  /opt/riggerhub-web/docker-compose.yml
```

## Security Considerations

### Environment Security

- All API keys stored in secure environment variables
- SSL/TLS encryption for all communications
- Regular security updates and vulnerability scanning
- Access control via SSH keys only

### Application Security

- Content Security Policy (CSP) headers
- HTTPS-only cookies
- Input validation and sanitization
- Regular dependency updates

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Database Connection Issues**
   ```bash
   # Check Supabase connectivity
   curl -I https://supabase.sxc.codes/health
   ```

3. **SSL Certificate Issues**
   ```bash
   # Renew Let's Encrypt certificates
   certbot renew --nginx
   ```

## Support and Maintenance

### Core Team Contacts
- **Jack Jonas**: jackjonas95@gmail.com (Architecture & DevOps)
- **Tia**: tiatheone@protonmail.com (Development & Security)

### Infrastructure Access
- **VPS Management**: SSH access to docker.sxc.codes
- **Database Access**: Supabase dashboard at supabase.sxc.codes
- **Monitoring**: Grafana dashboard at grafana.sxc.codes

### Maintenance Schedule
- **Security Updates**: Weekly
- **Dependency Updates**: Monthly
- **Infrastructure Review**: Quarterly
- **Backup Verification**: Weekly

---

*This deployment guide is maintained by the RiggerHub development team and updated with each major release.*
